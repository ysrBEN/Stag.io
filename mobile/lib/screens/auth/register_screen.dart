// ============================================================
// register_screen.dart - Registration page with Multi-step flow
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  int _step = 1;
  final _formKey1 = GlobalKey<FormState>();
  final _formKey2 = GlobalKey<FormState>();

  // Step 1 Controllers & Fields
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();
  String _role = 'student';
  bool _obscurePass = true;
  bool _obscureConfirmPass = true;
  String _selectedAvatarEmoji = '👨‍💻'; // Beautiful mock emoji avatar

  // Step 2 Student Controllers & Fields
  final _uniCtrl = TextEditingController();
  final _fieldCtrl = TextEditingController();
  String? _selectedYear;
  String? _selectedWilaya;
  final List<String> _selectedSkills = [];
  final _customSkillCtrl = TextEditingController();
  final List<String> _preloadedSkills = [
    'React', 'Node.js', 'Python', 'Java', 'Laravel', 'Django',
    'Flutter', 'SQL', 'MongoDB', 'Express', 'Vue.js', 'Angular',
    'Docker', 'Git', 'TypeScript', 'PHP', 'Spring Boot', 'FastAPI'
  ];

  // Step 2 Company Controllers & Fields
  final _companyNameCtrl = TextEditingController();
  String? _companyWilaya;
  String? _companyIndustry;
  final _websiteCtrl = TextEditingController(text: 'https://');

  final List<String> _mockAvatarEmojis = [
    '👨‍💻', '👩‍💻', '🚀', '🎨', '💼', '🏢', '🤖', '⚡', '🧠', '🎓'
  ];

  final List<String> _academicYears = [
    '1CPI', '2CPI', '1CS', '2CS', '3CS', 'L1', 'L2', 'L3', 'M1', 'M2'
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _confirmPassCtrl.dispose();
    _uniCtrl.dispose();
    _fieldCtrl.dispose();
    _customSkillCtrl.dispose();
    _companyNameCtrl.dispose();
    _websiteCtrl.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_step == 1) {
      if (!_formKey1.currentState!.validate()) return;
      
      // Auto-fill company name if they selected company role
      if (_role == 'company' && _companyNameCtrl.text.isEmpty) {
        _companyNameCtrl.text = _nameCtrl.text;
      }
      
      setState(() => _step = 2);
    }
  }

  void _prevStep() {
    if (_step == 2) {
      setState(() => _step = 1);
    }
  }

  Future<void> _submitRegister() async {
    if (!_formKey2.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();

    final success = await auth.register(
      email: _emailCtrl.text.trim(),
      password: _passCtrl.text,
      role: _role,
      name: _role == 'student' ? _nameCtrl.text.trim() : null,
      companyName: _role == 'company' ? _companyNameCtrl.text.trim() : null,
      wilaya: _role == 'student' ? _selectedWilaya : _companyWilaya,
      university: _role == 'student' ? _uniCtrl.text.trim() : null,
      fieldOfStudy: _role == 'student' ? _fieldCtrl.text.trim() : null,
      academicYear: _role == 'student' ? _selectedYear : null,
      skills: _role == 'student' ? _selectedSkills : null,
      industry: _role == 'company' ? _companyIndustry : null,
      websiteUrl: _role == 'company' ? _websiteCtrl.text.trim() : null,
      profilePicture: _selectedAvatarEmoji,
    );

    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registration successful! Please wait for admin approval.'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.error ?? 'Registration failed'),
          backgroundColor: AppTheme.danger,
        ),
      );
    }
  }

  void _openAvatarPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E1B4B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Choose your Avatar emoji',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: _mockAvatarEmojis.map((emoji) {
                  final isSelected = emoji == _selectedAvatarEmoji;
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedAvatarEmoji = emoji);
                      Navigator.pop(ctx);
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.primary : const Color(0xFF0F0E2A),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? Colors.white : Colors.white.withOpacity(0.1),
                          width: 2,
                        ),
                      ),
                      child: Text(emoji, style: const TextStyle(fontSize: 28)),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
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
            colors: [Color(0xFF0F0E2A), Color(0xFF1E1B4B), Color(0xFF0F172A)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () {
                        if (_step == 2) {
                          _prevStep();
                        } else {
                          Navigator.pop(context);
                        }
                      },
                    ),
                    Text(
                      'Create Account',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Padding(
                  padding: EdgeInsets.only(left: 12.0),
                  child: Text(
                    'Join Stag.io network today',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 14),
                  ),
                ),
                const SizedBox(height: 16),

                // Avatar Upload Section
                Center(
                  child: Column(
                    children: [
                      GestureDetector(
                        onTap: _openAvatarPicker,
                        child: Stack(
                          alignment: Alignment.bottomRight,
                          children: [
                            Container(
                              width: 84,
                              height: 84,
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F0E2A),
                                shape: BoxShape.circle,
                                border: Border.all(color: AppTheme.primary, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.primary.withOpacity(0.3),
                                    blurRadius: 10,
                                    spreadRadius: 2,
                                  )
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  _selectedAvatarEmoji,
                                  style: const TextStyle(fontSize: 40),
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(
                                color: AppTheme.primary,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.camera_alt, size: 14, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Upload Optional avatar',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1B4B).withOpacity(0.85),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF3730A3).withOpacity(0.6)),
                  ),
                  child: AnimatedCrossFade(
                    duration: const Duration(milliseconds: 300),
                    crossFadeState: _step == 1
                        ? CrossFadeState.showFirst
                        : CrossFadeState.showSecond,
                    firstChild: _buildStep1(),
                    secondChild: _role == 'student' ? _buildStudentStep2(auth) : _buildCompanyStep2(auth),
                  ),
                ),
                const SizedBox(height: 16),
                
                if (_step == 1)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Already have an account? ', style: TextStyle(color: AppTheme.textMuted)),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: const Text(
                          'Login',
                          style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // STEP 1 UI
  Widget _buildStep1() {
    return Form(
      key: _formKey1,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _nameCtrl,
            decoration: const InputDecoration(
              labelText: 'Full Name',
              prefixIcon: Icon(Icons.person_outlined, color: AppTheme.primary),
            ),
            validator: (v) => v == null || v.isEmpty ? 'Please enter your name' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(
              labelText: 'Email Address',
              prefixIcon: Icon(Icons.email_outlined, color: AppTheme.primary),
            ),
            validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passCtrl,
            obscureText: _obscurePass,
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock_outlined, color: AppTheme.primary),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePass ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                  color: AppTheme.textMuted,
                ),
                onPressed: () => setState(() => _obscurePass = !_obscurePass),
              ),
            ),
            validator: (v) => v == null || v.length < 6 ? 'Password must be at least 6 chars' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _confirmPassCtrl,
            obscureText: _obscureConfirmPass,
            decoration: InputDecoration(
              labelText: 'Confirm Password',
              prefixIcon: const Icon(Icons.lock_outline, color: AppTheme.primary),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirmPass ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                  color: AppTheme.textMuted,
                ),
                onPressed: () => setState(() => _obscureConfirmPass = !_obscureConfirmPass),
              ),
            ),
            validator: (v) {
              if (v != _passCtrl.text) return 'Passwords do not match';
              return null;
            },
          ),
          const SizedBox(height: 20),

          // Role Selector Section
          const Text(
            'I am a...',
            style: TextStyle(color: AppTheme.textMuted, fontWeight: FontWeight.bold, fontSize: 13),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _buildRoleCard('student', Icons.school_outlined, 'Student', 'Looking for an internship'),
              const SizedBox(width: 12),
              _buildRoleCard('company', Icons.business_outlined, 'Company', 'Looking for talent'),
            ],
          ),
          const SizedBox(height: 24),

          SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: _nextStep,
              child: const Text('Next Step', style: TextStyle(fontSize: 16)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard(String role, IconData icon, String title, String subtitle) {
    final selected = _role == role;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _role = role),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: selected ? AppTheme.primary.withOpacity(0.15) : const Color(0xFF0F0E2A).withOpacity(0.5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppTheme.primary : const Color(0xFF3730A3).withOpacity(0.4),
              width: selected ? 2 : 1,
            ),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: AppTheme.primary.withOpacity(0.1),
                      blurRadius: 10,
                      spreadRadius: 1,
                    )
                  ]
                : null,
          ),
          child: Column(
            children: [
              Icon(icon, color: selected ? AppTheme.primary : AppTheme.textMuted, size: 28),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  color: selected ? Colors.white : AppTheme.textLight,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // STEP 2 STUDENT UI
  Widget _buildStudentStep2(AuthProvider auth) {
    return Form(
      key: _formKey2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _uniCtrl,
            decoration: const InputDecoration(
              labelText: 'University Name',
              prefixIcon: Icon(Icons.school_outlined, color: AppTheme.primary),
            ),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _fieldCtrl,
            decoration: const InputDecoration(
              labelText: 'Field of Study',
              prefixIcon: Icon(Icons.book_outlined, color: AppTheme.primary),
            ),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 16),

          DropdownButtonFormField<String>(
            value: _selectedYear,
            decoration: const InputDecoration(
              labelText: 'Academic Year',
              prefixIcon: Icon(Icons.calendar_today_outlined, color: AppTheme.primary),
            ),
            items: _academicYears.map((year) {
              return DropdownMenuItem(
                value: year,
                child: Text(year),
              );
            }).toList(),
            onChanged: (val) => setState(() => _selectedYear = val),
            validator: (v) => v == null ? 'Please select a year' : null,
            dropdownColor: const Color(0xFF1E1B4B),
          ),
          const SizedBox(height: 16),

          DropdownButtonFormField<String>(
            value: _selectedWilaya,
            decoration: const InputDecoration(
              labelText: 'Wilaya',
              prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.primary),
            ),
            items: AppConstants.algerianWilayas.map((wilaya) {
              return DropdownMenuItem(
                value: wilaya,
                child: Text(wilaya),
              );
            }).toList(),
            onChanged: (val) => setState(() => _selectedWilaya = val),
            validator: (v) => v == null ? 'Please select a Wilaya' : null,
            dropdownColor: const Color(0xFF1E1B4B),
          ),
          const SizedBox(height: 20),

          // Tech Skills Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Tech Skills (Optional)',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(color: AppTheme.textLight, fontWeight: FontWeight.bold),
              ),
              Text(
                '${_selectedSkills.length} selected',
                style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _preloadedSkills.map((skill) {
              final isSelected = _selectedSkills.contains(skill);
              return GestureDetector(
                onTap: () {
                  setState(() {
                    if (isSelected) {
                      _selectedSkills.remove(skill);
                    } else {
                      _selectedSkills.add(skill);
                    }
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primary : const Color(0xFF0F0E2A).withOpacity(0.5),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected ? AppTheme.primary : const Color(0xFF3730A3).withOpacity(0.4),
                    ),
                  ),
                  child: Text(
                    skill,
                    style: TextStyle(
                      color: isSelected ? Colors.white : AppTheme.textLight,
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),

          // Custom skill adder
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _customSkillCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Add a custom skill...',
                    hintText: 'Enter skill name',
                  ),
                  onSubmitted: (val) {
                    if (val.trim().isNotEmpty && !_preloadedSkills.contains(val.trim())) {
                      setState(() {
                        _preloadedSkills.add(val.trim());
                        _selectedSkills.add(val.trim());
                        _customSkillCtrl.clear();
                      });
                    }
                  },
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filledTonal(
                onPressed: () {
                  final val = _customSkillCtrl.text.trim();
                  if (val.isNotEmpty && !_preloadedSkills.contains(val)) {
                    setState(() {
                      _preloadedSkills.add(val);
                      _selectedSkills.add(val);
                      _customSkillCtrl.clear();
                    });
                  }
                },
                icon: const Icon(Icons.add),
                style: IconButton.styleFrom(backgroundColor: AppTheme.primary),
              ),
            ],
          ),
          const SizedBox(height: 28),

          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _prevStep,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF3730A3)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text('Back', style: TextStyle(color: Colors.white)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: auth.isLoading ? null : _submitRegister,
                  child: auth.isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Create Account'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // STEP 2 COMPANY UI
  Widget _buildCompanyStep2(AuthProvider auth) {
    return Form(
      key: _formKey2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _companyNameCtrl,
            decoration: const InputDecoration(
              labelText: 'Company Name',
              prefixIcon: Icon(Icons.business_outlined, color: AppTheme.primary),
            ),
            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          ),
          const SizedBox(height: 16),

          DropdownButtonFormField<String>(
            value: _companyWilaya,
            decoration: const InputDecoration(
              labelText: 'Wilaya',
              prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.primary),
            ),
            items: AppConstants.algerianWilayas.map((wilaya) {
              return DropdownMenuItem(
                value: wilaya,
                child: Text(wilaya),
              );
            }).toList(),
            onChanged: (val) => setState(() => _companyWilaya = val),
            validator: (v) => v == null ? 'Please select a Wilaya' : null,
            dropdownColor: const Color(0xFF1E1B4B),
          ),
          const SizedBox(height: 16),

          DropdownButtonFormField<String>(
            value: _companyIndustry,
            decoration: const InputDecoration(
              labelText: 'Industry',
              prefixIcon: Icon(Icons.domain_outlined, color: AppTheme.primary),
            ),
            items: AppConstants.industries.map((ind) {
              return DropdownMenuItem(
                value: ind,
                child: Text(ind),
              );
            }).toList(),
            onChanged: (val) => setState(() => _companyIndustry = val),
            validator: (v) => v == null ? 'Please select an Industry' : null,
            dropdownColor: const Color(0xFF1E1B4B),
          ),
          const SizedBox(height: 16),

          TextFormField(
            controller: _websiteCtrl,
            keyboardType: TextInputType.url,
            decoration: const InputDecoration(
              labelText: 'Company Website (Optional)',
              prefixIcon: Icon(Icons.link, color: AppTheme.primary),
            ),
            validator: (v) {
              if (v != null && v.isNotEmpty && v != 'https://' && !v.startsWith('http')) {
                return 'Enter valid URL starting with http:// or https://';
              }
              return null;
            },
          ),
          const SizedBox(height: 28),

          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _prevStep,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFF3730A3)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text('Back', style: TextStyle(color: Colors.white)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: auth.isLoading ? null : _submitRegister,
                  child: auth.isLoading
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Create Account'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
