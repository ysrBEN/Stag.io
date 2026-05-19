// ============================================================
// forgot_password_screen.dart
// ============================================================
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';
import 'package:dio/dio.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _api = ApiService();
  final _emailCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  int _step = 1; // 1=email, 2=code, 3=new pass
  bool _loading = false;
  String? _error;

  Future<void> _sendCode() async {
    setState(() { _loading = true; _error = null; });
    try {
      await _api.post('/auth/forgot-password', data: {'email': _emailCtrl.text.trim()});
      setState(() { _step = 2; _loading = false; });
    } on DioException catch (e) {
      setState(() { _error = e.response?.data?['message'] ?? 'Failed to send code'; _loading = false; });
    }
  }

  Future<void> _verifyCode() async {
    setState(() { _loading = true; _error = null; });
    try {
      await _api.post('/auth/verify-reset-code', data: {
        'email': _emailCtrl.text.trim(),
        'code': _codeCtrl.text.trim(),
      });
      setState(() { _step = 3; _loading = false; });
    } on DioException catch (e) {
      setState(() { _error = e.response?.data?['message'] ?? 'Invalid code'; _loading = false; });
    }
  }

  Future<void> _resetPassword() async {
    setState(() { _loading = true; _error = null; });
    try {
      await _api.post('/auth/reset-password', data: {
        'email': _emailCtrl.text.trim(),
        'code': _codeCtrl.text.trim(),
        'newPassword': _passCtrl.text,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset successfully!'), backgroundColor: AppTheme.success),
      );
      Navigator.pop(context);
    } on DioException catch (e) {
      setState(() { _error = e.response?.data?['message'] ?? 'Reset failed'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F1C2E), Color(0xFF162035), Color(0xFF0F1C2E)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(height: 16),
                Text('Reset Password', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                // Step indicators
                Row(
                  children: List.generate(3, (i) => Expanded(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      height: 4,
                      decoration: BoxDecoration(
                        color: _step >= i + 1 ? AppTheme.primary : const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  )),
                ),
                const SizedBox(height: 32),

                if (_error != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.danger.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(_error!, style: const TextStyle(color: AppTheme.danger)),
                  ),
                  const SizedBox(height: 16),
                ],

                if (_step == 1) ...[
                  Text('Enter your email address and we\'ll send you a verification code.',
                      style: TextStyle(color: AppTheme.textMuted)),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon: Icon(Icons.email_outlined, color: AppTheme.primary),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(width: double.infinity, height: 52,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _sendCode,
                      child: _loading ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                          : const Text('Send Code'),
                    ),
                  ),
                ] else if (_step == 2) ...[
                  Text('Enter the 6-digit code sent to ${_emailCtrl.text}',
                      style: TextStyle(color: AppTheme.textMuted)),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _codeCtrl,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 22, letterSpacing: 10),
                    decoration: const InputDecoration(labelText: 'Verification Code'),
                    maxLength: 6,
                  ),
                  const SizedBox(height: 20),
                  SizedBox(width: double.infinity, height: 52,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _verifyCode,
                      child: _loading ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                          : const Text('Verify Code'),
                    ),
                  ),
                ] else ...[
                  Text('Enter your new password', style: TextStyle(color: AppTheme.textMuted)),
                  const SizedBox(height: 20),
                  TextFormField(
                    controller: _passCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'New Password',
                      prefixIcon: Icon(Icons.lock_outlined, color: AppTheme.primary),
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(width: double.infinity, height: 52,
                    child: ElevatedButton(
                      onPressed: _loading ? null : _resetPassword,
                      child: _loading ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                          : const Text('Reset Password'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
