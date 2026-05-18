// ============================================================
// company_profile_screen.dart - Premium Preview & Edit Profile
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/auth_provider.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../models/user_model.dart';

class CompanyProfileScreen extends StatefulWidget {
  const CompanyProfileScreen({super.key});

  @override
  State<CompanyProfileScreen> createState() => _CompanyProfileScreenState();
}

class _CompanyProfileScreenState extends State<CompanyProfileScreen> {
  final _api = ApiService();
  UserModel? _user;
  bool _loading = true;
  bool _editing = false;
  bool _saving = false;

  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();
  final _techCtrl = TextEditingController();
  String? _selectedWilaya;
  String? _selectedIndustry;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _websiteCtrl.dispose();
    _techCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final res = await _api.get('/company/profile');
      final user = UserModel.fromJson(res.data);
      setState(() {
        _user = user;
        _nameCtrl.text = user.companyName ?? '';
        _descCtrl.text = user.description ?? '';
        _websiteCtrl.text = user.websiteUrl ?? '';
        _techCtrl.text = user.techStacks.join(', '); // Assuming techStacks in model

        // Assign drop downs safely
        _selectedWilaya = AppConstants.algerianWilayas.contains(user.wilaya) ? user.wilaya : null;
        _selectedIndustry = AppConstants.industries.contains(user.industry) ? user.industry : null;

        _loading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty || _selectedWilaya == null || _selectedIndustry == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields'), backgroundColor: AppTheme.danger),
      );
      return;
    }

    setState(() => _saving = true);
    try {
      final techList = _techCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
      await _api.put('/company/profile', data: {
        'companyName': _nameCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'industry': _selectedIndustry,
        'wilaya': _selectedWilaya,
        'websiteUrl': _websiteCtrl.text.trim(),
        'techStacks': techList,
      });
      
      setState(() {
        _editing = false;
        _saving = false;
      });
      _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully!'), backgroundColor: AppTheme.success),
      );
    } catch (_) {
      setState(() => _saving = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update profile'), backgroundColor: AppTheme.danger),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    final auth = context.read<AuthProvider>();

    // Initial letters for avatar fallback
    String companyNameStr = _user?.companyName ?? auth.name ?? 'Company';
    List<String> words = companyNameStr.split(' ');
    String initials = words.take(2).map((w) => w.isNotEmpty ? w[0] : '').join('').toUpperCase();
    if (initials.isEmpty) initials = 'C';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Premium Avatar Profile Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1B4B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF3730A3)),
            ),
            child: Column(
              children: [
                // Logo Circle fallback
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF14B8A6), Color(0xFF06B6D4)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF14B8A6).withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Center(
                    child: Text(
                      initials,
                      style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  companyNameStr,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF14B8A6).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF14B8A6).withOpacity(0.3)),
                  ),
                  child: Text(
                    _user?.industry ?? 'Company Sector',
                    style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  _user?.email ?? auth.email ?? '',
                  style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Action Edit/Cancel row
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () => setState(() => _editing = !_editing),
                icon: Icon(_editing ? Icons.close : Icons.edit_outlined, size: 18),
                label: Text(_editing ? 'Cancel' : 'Edit Profile'),
                style: TextButton.styleFrom(foregroundColor: AppTheme.accent),
              ),
            ],
          ),

          if (_editing) ...[
            // Edit Mode Fields
            TextField(
              controller: _nameCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Company Name',
                prefixIcon: Icon(Icons.business_outlined, color: AppTheme.primary),
              ),
            ),
            const SizedBox(height: 14),

            // Industry Sector Dropdown
            DropdownButtonFormField<String>(
              value: _selectedIndustry,
              dropdownColor: const Color(0xFF0F1C2E),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: const InputDecoration(
                labelText: 'Industry Sector',
                prefixIcon: Icon(Icons.category_outlined, color: AppTheme.primary),
              ),
              hint: const Text('Select Sector', style: TextStyle(color: AppTheme.textMuted)),
              items: AppConstants.industries.map((ind) {
                return DropdownMenuItem<String>(value: ind, child: Text(ind));
              }).toList(),
              onChanged: (val) => setState(() => _selectedIndustry = val),
            ),
            const SizedBox(height: 14),

            // Wilaya Dropdown
            DropdownButtonFormField<String>(
              value: _selectedWilaya,
              dropdownColor: const Color(0xFF0F1C2E),
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: const InputDecoration(
                labelText: 'Location (Wilaya)',
                prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.primary),
              ),
              hint: const Text('Select Wilaya', style: TextStyle(color: AppTheme.textMuted)),
              items: AppConstants.algerianWilayas.map((w) {
                return DropdownMenuItem<String>(value: w, child: Text(w));
              }).toList(),
              onChanged: (val) => setState(() => _selectedWilaya = val),
            ),
            const SizedBox(height: 14),

            // Website URL
            TextField(
              controller: _websiteCtrl,
              style: const TextStyle(color: Colors.white),
              keyboardType: TextInputType.url,
              decoration: const InputDecoration(
                labelText: 'Website URL',
                prefixIcon: Icon(Icons.link_outlined, color: AppTheme.primary),
                hintText: 'https://yourcompany.dz',
              ),
            ),
            const SizedBox(height: 14),

            // Technology Field
            TextField(
              controller: _techCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Technology',
                prefixIcon: Icon(Icons.code_rounded, color: AppTheme.primary),
                hintText: 'e.g. React, Flutter, Node.js',
              ),
            ),
            const SizedBox(height: 14),

            // Description
            TextField(
              controller: _descCtrl,
              maxLines: 4,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Description',
                prefixIcon: Icon(Icons.info_outlined, color: AppTheme.primary),
                hintText: 'Tell students about your company...',
              ),
            ),
            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: _saving 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Save Changes'),
              ),
            ),
          ] else ...[
            // Preview Mode Card Details
            _infoRow(Icons.business_outlined, 'Industry / Sector', _user?.industry),
            _infoRow(Icons.location_on_outlined, 'Location', _user?.wilaya),
            _infoRow(Icons.code_rounded, 'Technology', _user?.techStacks.join(', ')), // Assuming techStacks in model
            _infoRow(Icons.link_outlined, 'Website', _user?.websiteUrl),
            
            if (_user?.description != null && _user!.description!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1B4B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF3730A3).withOpacity(0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('About Our Company', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text(
                      '"${_user!.description!}"',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withOpacity(0.9),
                        fontStyle: FontStyle.italic,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 44,
              child: OutlinedButton.icon(
                onPressed: () => context.read<AuthProvider>().logout(),
                icon: const Icon(Icons.logout, size: 18),
                label: const Text('Logout', style: TextStyle(fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppTheme.danger,
                  side: const BorderSide(color: AppTheme.danger),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String? value) {
    if (value == null || value.trim().isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1B4B),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF3730A3).withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primary, size: 20),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w600)),
                const SizedBox(height: 3),
                Text(value, style: const TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
