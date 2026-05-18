// ============================================================
// student_profile_screen.dart
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/auth_provider.dart';
import '../../core/app_theme.dart';
import '../../models/user_model.dart';

class StudentProfileScreen extends StatefulWidget {
  const StudentProfileScreen({super.key});

  @override
  State<StudentProfileScreen> createState() => _StudentProfileScreenState();
}

class _StudentProfileScreenState extends State<StudentProfileScreen> {
  final _api = ApiService();
  UserModel? _user;
  bool _loading = true;
  bool _editing = false;
  bool _saving = false;
  bool _analyzing = false;

  final _nameCtrl = TextEditingController();
  final _uniCtrl = TextEditingController();
  final _fieldCtrl = TextEditingController();
  final _yearCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  final _githubCtrl = TextEditingController();
  final _portfolioCtrl = TextEditingController();
  final _wilayaCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _uniCtrl.dispose(); _fieldCtrl.dispose();
    _yearCtrl.dispose(); _bioCtrl.dispose(); _githubCtrl.dispose();
    _portfolioCtrl.dispose(); _wilayaCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await _api.get('/students/profile');
      final user = UserModel.fromJson(res.data);
      setState(() {
        _user = user;
        _nameCtrl.text = user.name ?? '';
        _uniCtrl.text = user.university ?? '';
        _fieldCtrl.text = user.fieldOfStudy ?? '';
        _yearCtrl.text = user.academicYear ?? '';
        _bioCtrl.text = user.bio ?? '';
        _githubCtrl.text = user.githubUrl ?? '';
        _portfolioCtrl.text = user.portfolioUrl ?? '';
        _wilayaCtrl.text = user.wilaya ?? '';
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await _api.put('/students/profile', data: {
        'name': _nameCtrl.text,
        'university': _uniCtrl.text,
        'fieldOfStudy': _fieldCtrl.text,
        'academicYear': _yearCtrl.text,
        'bio': _bioCtrl.text,
        'githubUrl': _githubCtrl.text,
        'portfolioUrl': _portfolioCtrl.text,
        'wilaya': _wilayaCtrl.text,
      });
      setState(() { _editing = false; _saving = false; });
      _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated!'), backgroundColor: AppTheme.success),
      );
    } catch (_) {
      setState(() => _saving = false);
    }
  }

  Future<void> _analyzeWithAI() async {
    setState(() => _analyzing = true);
    try {
      // Logic for AI analysis...
      await Future.delayed(const Duration(seconds: 2));
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('AI Profile Analysis'),
          content: const Text('Your profile looks strong! Consider adding more React projects to stand out to top companies.'),
          actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Got it!'))],
        ),
      );
    } finally {
      setState(() => _analyzing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final auth = context.watch<AuthProvider>();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20)],
            ),
            child: Column(
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Container(
                      width: 100, height: 100,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AppTheme.primary, Color(0xFF4F46E5)]),
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [BoxShadow(color: AppTheme.primary.withOpacity(0.3), blurRadius: 15)],
                      ),
                      child: const Icon(Icons.person, color: Colors.white, size: 50),
                    ),
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(color: AppTheme.success, shape: BoxShape.circle),
                      child: const Icon(Icons.check, color: Colors.white, size: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(_user?.displayName ?? auth.name ?? 'Student',
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                Text(_user?.email ?? auth.email ?? '',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 24),

          if (!_editing) ...[
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _analyzing ? null : _analyzeWithAI,
                icon: _analyzing ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.psychology_outlined),
                label: const Text('Analyze my Profile with AI'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Profile Details', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              IconButton.filledTonal(
                onPressed: () => setState(() => _editing = !_editing),
                icon: Icon(_editing ? Icons.close : Icons.edit),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (_editing) ...[
            _field('Full Name', _nameCtrl, Icons.person_outlined),
            const SizedBox(height: 12),
            _field('University', _uniCtrl, Icons.school_outlined),
            const SizedBox(height: 12),
            _field('Field of Study', _fieldCtrl, Icons.book_outlined),
            const SizedBox(height: 12),
            _field('Academic Year', _yearCtrl, Icons.calendar_today_outlined),
            const SizedBox(height: 12),
            _field('Wilaya', _wilayaCtrl, Icons.location_on_outlined),
            const SizedBox(height: 12),
            _field('GitHub URL', _githubCtrl, Icons.code),
            const SizedBox(height: 12),
            _field('Portfolio/LinkedIn URL', _portfolioCtrl, Icons.link),
            const SizedBox(height: 12),
            TextField(
              controller: _bioCtrl,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Bio / About Me', hintText: 'Tell companies a little about yourself...'),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity, height: 52,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ] else ...[
            _infoRow(Icons.school_outlined, 'University', _user?.university),
            _infoRow(Icons.book_outlined, 'Field of Study', _user?.fieldOfStudy),
            _infoRow(Icons.calendar_today_outlined, 'Academic Year', _user?.academicYear),
            _infoRow(Icons.location_on_outlined, 'Wilaya', _user?.wilaya),
            _infoRow(Icons.code, 'GitHub', _user?.githubUrl),
            _infoRow(Icons.link, 'Portfolio', _user?.portfolioUrl),
            if (_user?.bio != null && _user!.bio!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Bio', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(_user!.bio!, style: const TextStyle(fontSize: 14, height: 1.5)),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity, height: 48,
              child: OutlinedButton.icon(
                onPressed: () => context.read<AuthProvider>().logout(),
                icon: const Icon(Icons.logout),
                label: const Text('Logout'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.danger,
                  side: const BorderSide(color: AppTheme.danger),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _field(String label, TextEditingController ctrl, IconData icon) {
    return TextField(
      controller: ctrl,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: AppTheme.primary),
        contentPadding: const EdgeInsets.all(16),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: AppTheme.primary, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
