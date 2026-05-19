// ============================================================
// login_screen.dart - Login page with Google Parity
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../core/google_helper.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../widgets/brand_logo.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscurePass = true;

  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final success = await auth.login(_emailCtrl.text.trim(), _passCtrl.text);
    if (!mounted) return;
    if (success) {
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Login failed'),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  // Complete registration for new google user
  void _showGoogleRegisterSheet(Map<String, dynamic> googleData, String token) {
    String selectedRole = 'student';
    final nameCtrl = TextEditingController(text: googleData['name'] ?? '');
    final companyNameCtrl = TextEditingController(text: googleData['name'] ?? '');
    final univCtrl = TextEditingController();
    final fieldCtrl = TextEditingController();
    final yearCtrl = TextEditingController();
    String? selectedWilaya;
    String? selectedIndustry;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F1C2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (BuildContext context, StateSetter setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                top: 20,
                left: 20,
                right: 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Complete Google Signup',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white60),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 12),

                    // Role Select
                    const Text('Select Your Role', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        ChoiceChip(
                          label: const Text('🎓 Student'),
                          selected: selectedRole == 'student',
                          onSelected: (_) => setModalState(() => selectedRole = 'student'),
                          selectedColor: AppTheme.primary,
                          backgroundColor: const Color(0xFF162035),
                        ),
                        const SizedBox(width: 10),
                        ChoiceChip(
                          label: const Text('🏢 Company'),
                          selected: selectedRole == 'company',
                          onSelected: (_) => setModalState(() => selectedRole = 'company'),
                          selectedColor: AppTheme.primary,
                          backgroundColor: const Color(0xFF162035),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Student Forms
                    if (selectedRole == 'student') ...[
                      TextField(
                        controller: nameCtrl,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Full Name'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: univCtrl,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'University'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: fieldCtrl,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Field of Study'),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: yearCtrl,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Academic Year (e.g. 3CS)'),
                      ),
                    ],

                    // Company Forms
                    if (selectedRole == 'company') ...[
                      TextField(
                        controller: companyNameCtrl,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(labelText: 'Company Name'),
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        value: selectedIndustry,
                        dropdownColor: const Color(0xFF0F1C2E),
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: const InputDecoration(labelText: 'Industry Sector'),
                        hint: const Text('Select Industry Sector', style: TextStyle(color: AppTheme.textMuted)),
                        items: AppConstants.industries.map((ind) {
                          return DropdownMenuItem<String>(value: ind, child: Text(ind));
                        }).toList(),
                        onChanged: (val) => setModalState(() => selectedIndustry = val),
                      ),
                    ],

                    const SizedBox(height: 12),
                    // Shared Wilaya Dropdown
                    DropdownButtonFormField<String>(
                      value: selectedWilaya,
                      dropdownColor: const Color(0xFF0F1C2E),
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(labelText: 'Location (Wilaya)'),
                      hint: const Text('Select Wilaya', style: TextStyle(color: AppTheme.textMuted)),
                      items: AppConstants.algerianWilayas.map((w) {
                        return DropdownMenuItem<String>(value: w, child: Text(w));
                      }).toList(),
                      onChanged: (val) => setModalState(() => selectedWilaya = val),
                    ),
                    const SizedBox(height: 24),

                    // Submit Register
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () async {
                          final payload = {
                            'credential': token,
                            'role': selectedRole,
                            'wilaya': selectedWilaya,
                          };

                          if (selectedRole == 'student') {
                            if (nameCtrl.text.isEmpty || univCtrl.text.isEmpty || fieldCtrl.text.isEmpty || yearCtrl.text.isEmpty || selectedWilaya == null) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                const SnackBar(content: Text('Please fill all required fields'), backgroundColor: AppTheme.danger),
                              );
                              return;
                            }
                            payload['name'] = nameCtrl.text.trim();
                            payload['university'] = univCtrl.text.trim();
                            payload['fieldOfStudy'] = fieldCtrl.text.trim();
                            payload['academicYear'] = yearCtrl.text.trim();
                          } else {
                            if (companyNameCtrl.text.isEmpty || selectedIndustry == null || selectedWilaya == null) {
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                const SnackBar(content: Text('Please fill all required fields'), backgroundColor: AppTheme.danger),
                              );
                              return;
                            }
                            payload['companyName'] = companyNameCtrl.text.trim();
                            payload['industry'] = selectedIndustry;
                          }

                          final auth = context.read<AuthProvider>();
                          final success = await auth.googleRegister(payload);
                          if (!mounted) return;
                          if (success) {
                            Navigator.pop(ctx);
                            Navigator.of(context).pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Google registration successful! Welcome 🎉'), backgroundColor: AppTheme.success),
                            );
                          } else {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              SnackBar(content: Text(auth.error ?? 'Registration failed'), backgroundColor: AppTheme.danger),
                            );
                          }
                        },
                        child: const Text('Complete Signup', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // Google SSO simulated account chooser
  void _handleGoogleLogin() {
    final customEmailCtrl = TextEditingController();
    final customNameCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F1C2E),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: const Text('G', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 15)),
              ),
              const SizedBox(width: 12),
              const Text('Sign in with Google', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Choose an account to continue to Stag.io',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.white10, height: 1),
              
              // Preloaded Account 1
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  backgroundColor: AppTheme.primary.withOpacity(0.2),
                  child: const Text('Y', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                ),
                title: const Text('Yasser Yaser', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                subtitle: const Text('yasseryaser@gmail.com', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                onTap: () {
                  Navigator.pop(ctx);
                  _submitGoogleAuth('yasseryaser@gmail.com', 'Yasser Yaser', 'google_id_yasser');
                },
              ),
              const Divider(color: Colors.white10, height: 1),

              // Option 2: Enter Custom Mock Profile
              Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  title: const Text('Use another account', style: TextStyle(color: AppTheme.accent, fontSize: 13, fontWeight: FontWeight.bold)),
                  children: [
                    const SizedBox(height: 8),
                    TextField(
                      controller: customNameCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        hintText: 'e.g. John Doe',
                        contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: customEmailCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        hintText: 'e.g. johndoe@gmail.com',
                        contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      height: 38,
                      child: ElevatedButton(
                        onPressed: () {
                          final email = customEmailCtrl.text.trim();
                          final name = customNameCtrl.text.trim();
                          if (email.isEmpty || !email.contains('@') || name.isEmpty) {
                            ScaffoldMessenger.of(ctx).showSnackBar(
                              const SnackBar(content: Text('Please enter a valid name and email'), backgroundColor: AppTheme.danger),
                            );
                            return;
                          }
                          Navigator.pop(ctx);
                          _submitGoogleAuth(email, name, 'google_id_${email.split('@')[0]}');
                        },
                        child: const Text('Continue', style: TextStyle(fontSize: 12)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _signInWithRealGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        throw Exception("Could not fetch ID Token from Google Authentication.");
      }

      await _submitGoogleAuth(googleUser.email, googleUser.displayName ?? '', idToken);
    } catch (e) {
      if (!mounted) return;
      _showGoogleConfigurationErrorDialog(e.toString());
    }
  }

  void _showGoogleConfigurationErrorDialog(String errorMsg) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F1C2E),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 28),
              const SizedBox(width: 12),
              const Text('Setup Required', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'To login with a real Google account, your app must be registered in the Google/Firebase Console.',
                style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 12),
              const Text(
                'Steps to complete:',
                style: TextStyle(color: AppTheme.accent, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              const Text(
                '1. Register com.stagio.stagio_mobile in Firebase Console.\n'
                '2. Add your developer SHA-1 signing fingerprint to settings.\n'
                '3. Download google-services.json and save it inside mobile/android/app/.',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 11, height: 1.4),
              ),
              const SizedBox(height: 16),
              const Divider(color: Colors.white10),
              const SizedBox(height: 8),
              const Text(
                'Would you like to use the fully functional Google SSO Simulator for testing instead?',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                _handleGoogleLogin();
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
              child: const Text('Start Simulator'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _submitGoogleAuth(String email, String name, String googleId) async {
    final token = GoogleHelper.generateMockGoogleIdToken(email: email, name: name, googleId: googleId);
    final auth = context.read<AuthProvider>();
    
    final res = await auth.googleLogin(token);
    if (!mounted) return;

    if (res != null) {
      if (res['isNewUser'] == true) {
        _showGoogleRegisterSheet(res, token);
      } else {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Logged in successfully with Google! 🎉'), backgroundColor: AppTheme.success),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Google authentication failed.'), backgroundColor: AppTheme.danger),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

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
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const BrandLogo(role: 'student', size: 48),
                  const SizedBox(height: 4),
                  Text(
                    'Internship Management Platform',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textMuted,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Form card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF162035).withOpacity(0.8),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF1E293B), width: 1),
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Text(
                            'Welcome back',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w600,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text('Sign in to continue', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.textMuted, fontSize: 12)),
                          const SizedBox(height: 18),

                          // Email field
                          TextFormField(
                            controller: _emailCtrl,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Email',
                              prefixIcon: Icon(Icons.email_outlined, color: AppTheme.primary),
                            ),
                            validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
                          ),
                          const SizedBox(height: 14),

                          // Password field
                          TextFormField(
                            controller: _passCtrl,
                            obscureText: _obscurePass,
                            decoration: InputDecoration(
                              labelText: 'Password',
                              prefixIcon: const Icon(Icons.lock_outlined, color: AppTheme.primary),
                              suffixIcon: IconButton(
                                icon: Icon(_obscurePass ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: AppTheme.textMuted),
                                onPressed: () => setState(() => _obscurePass = !_obscurePass),
                              ),
                            ),
                            validator: (v) => v == null || v.isEmpty ? 'Password is required' : null,
                          ),
                          const SizedBox(height: 4),

                          // Forgot password
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
                              ),
                              child: Text('Forgot password?', style: TextStyle(color: AppTheme.accent, fontSize: 12)),
                            ),
                          ),
                          const SizedBox(height: 4),

                          // Login button
                          SizedBox(
                            height: 46,
                            child: ElevatedButton(
                              onPressed: auth.isLoading ? null : _login,
                              child: auth.isLoading
                                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                  : const Text('Sign In', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // --- Google Login Option ---
                          Row(
                            children: [
                              const Expanded(child: Divider(color: Colors.white10)),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                child: Text('or', style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11)),
                              ),
                              const Expanded(child: Divider(color: Colors.white10)),
                            ],
                          ),
                          const SizedBox(height: 14),

                          SizedBox(
                            height: 46,
                            child: OutlinedButton(
                              onPressed: auth.isLoading ? null : _signInWithRealGoogle,
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: Color(0xFF1E293B)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 20,
                                    height: 20,
                                    decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                                    alignment: Alignment.center,
                                    child: const Text('G', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold, fontSize: 13)),
                                  ),
                                  const SizedBox(width: 10),
                                  const Text(
                                    'Continue with Google',
                                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Register link
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text("Don't have an account? ", style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                              GestureDetector(
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const RegisterScreen()),
                                ),
                                child: Text('Sign Up', style: TextStyle(color: AppTheme.accent, fontWeight: FontWeight.w600, fontSize: 12)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
