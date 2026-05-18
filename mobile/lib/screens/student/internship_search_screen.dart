// ============================================================
// internship_search_screen.dart - Browse & apply to offers
// ============================================================
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';
import '../../models/offer_model.dart';

class InternshipSearchScreen extends StatefulWidget {
  const InternshipSearchScreen({super.key});

  @override
  State<InternshipSearchScreen> createState() => _InternshipSearchScreenState();
}

class _InternshipSearchScreenState extends State<InternshipSearchScreen> {
  final _api = ApiService();
  List<OfferModel> _offers = [];
  List<OfferModel> _filtered = [];
  Set<String> _appliedOfferIds = {};
  List<String> _userSkills = [];
  bool _loading = true;
  
  // Filters
  String _search = '';
  String? _selectedWilaya;
  String? _selectedType;
  List<String> _selectedSkills = [];
  String _sortBy = 'Best Match'; // 'Best Match' or 'Newest'
  String? _applyingId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final offersRes = await _api.get('/offers');
      final appsRes = await _api.get('/applications/my');
      final profileRes = await _api.get('/students/profile');

      if (!mounted) return;

      final list = (offersRes.data as List).map((e) => OfferModel.fromJson(e)).toList();
      final List<dynamic> appsList = appsRes.data is List ? appsRes.data : [];
      final Set<String> appliedIds = appsList.map<String>((app) {
        final off = app['offer'];
        return off is Map ? (off['_id'] ?? off['id'] ?? '') : off?.toString() ?? '';
      }).where((id) => id.isNotEmpty).toSet();

      final userProfile = profileRes.data;
      final List<String> skills = List<String>.from(userProfile['skills'] ?? []);

      setState(() {
        _offers = list;
        _appliedOfferIds = appliedIds;
        _userSkills = skills;
        _loading = false;
        _applyFilters();
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _applyFilters() {
    List<OfferModel> results = _offers.where((o) {
      final matchesSearch = _search.isEmpty || 
          o.title.toLowerCase().contains(_search.toLowerCase()) || 
          o.companyName.toLowerCase().contains(_search.toLowerCase());
      
      final matchesWilaya = _selectedWilaya == null || _selectedWilaya == 'All Wilayas' || o.location == _selectedWilaya;
      final matchesType = _selectedType == null || _selectedType == 'All' || o.type == _selectedType;
      
      final matchesSkills = _selectedSkills.isEmpty || 
          _selectedSkills.every((s) => o.technologies.any((ot) => ot.toLowerCase() == s.toLowerCase()));

      return matchesSearch && matchesWilaya && matchesType && matchesSkills;
    }).toList();

    // Sorting logic
    if (_sortBy == 'Best Match') {
      results.sort((a, b) {
        int scoreA = a.technologies.where((s) => _userSkills.any((us) => us.toLowerCase() == s.toLowerCase())).length;
        int scoreB = b.technologies.where((s) => _userSkills.any((us) => us.toLowerCase() == s.toLowerCase())).length;
        return scoreB.compareTo(scoreA); // Higher score first
      });
    } else {
      results.sort((a, b) => b.id.compareTo(a.id)); // Dummy newest (ID based)
    }

    setState(() {
      _filtered = results;
    });
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: EdgeInsets.only(top: 20, left: 20, right: 20, bottom: MediaQuery.of(context).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Filters', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () {
                      setModalState(() {
                        _selectedWilaya = null;
                        _selectedType = null;
                        _selectedSkills = [];
                      });
                    },
                    child: const Text('Reset'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              const Text('Location', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              _buildDropdown(['All Wilayas', 'Algiers', 'Oran', 'Constantine', 'Setif', 'Blida'], _selectedWilaya, (v) {
                setModalState(() => _selectedWilaya = v);
              }),

              const SizedBox(height: 16),
              const Text('Internship Type', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['PFE', 'Summer', 'Part-time'].map((t) => ChoiceChip(
                  label: Text(t),
                  selected: _selectedType == t,
                  onSelected: (s) => setModalState(() => _selectedType = s ? t : null),
                )).toList(),
              ),

              const SizedBox(height: 16),
              const Text('Tech Skills', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['React', 'Node.js', 'Python', 'Java', 'Flutter', 'SQL', 'MongoDB'].map((s) {
                  final isSelected = _selectedSkills.contains(s);
                  return FilterChip(
                    label: Text(s),
                    selected: isSelected,
                    onSelected: (selected) {
                      setModalState(() {
                        if (selected) _selectedSkills.add(s);
                        else _selectedSkills.remove(s);
                      });
                    },
                  );
                }).toList(),
              ),

              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () {
                    _applyFilters();
                    Navigator.pop(context);
                  },
                  child: const Text('Show Results', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown(List<String> items, String? value, Function(String?) onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value ?? items[0],
          isExpanded: true,
          onChanged: onChanged,
          items: items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search & Filter Header
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: (v) { _search = v; _applyFilters(); },
                  decoration: const InputDecoration(
                    hintText: 'Title, Company...',
                    prefixIcon: Icon(Icons.search),
                    contentPadding: EdgeInsets.symmetric(vertical: 0),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              IconButton.filledTonal(
                onPressed: _showFilterSheet,
                icon: const Icon(Icons.tune),
              ),
            ],
          ),
        ),

        // Sort By & Results Count
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${_filtered.length} Results Found', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              DropdownButton<String>(
                value: _sortBy,
                underline: const SizedBox(),
                style: TextStyle(color: AppTheme.primary, fontSize: 13, fontWeight: FontWeight.bold),
                onChanged: (v) { if (v != null) setState(() { _sortBy = v; _applyFilters(); }); },
                items: ['Best Match', 'Newest'].map((s) => DropdownMenuItem(value: s, child: Text('Sort By: $s'))).toList(),
              ),
            ],
          ),
        ),

        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: _filtered.isEmpty
                      ? ListView(
                          children: [
                            SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                            const Center(child: Column(
                              children: [
                                Icon(Icons.search_off, size: 64, color: AppTheme.textMuted),
                                SizedBox(height: 16),
                                Text('No offers found matching your criteria', style: TextStyle(color: AppTheme.textMuted)),
                              ],
                            )),
                          ],
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) => _offerCard(_filtered[i]),
                        ),
                ),
        ),
      ],
    );
  }

  Widget _offerCard(OfferModel offer) {
    final hasAlreadyApplied = _appliedOfferIds.contains(offer.id);
    // Best match indicator
    final matchCount = offer.technologies.where((s) => _userSkills.any((us) => us.toLowerCase() == s.toLowerCase())).length;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: InkWell(
        onTap: () => _showOfferDetails(offer),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(offer.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(offer.companyName, style: const TextStyle(color: AppTheme.primary, fontSize: 13, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                  if (matchCount > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        children: [
                          const Icon(Icons.auto_awesome, size: 12, color: AppTheme.primary),
                          const SizedBox(width: 4),
                          Text('Match', style: TextStyle(color: AppTheme.primary, fontSize: 10, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _miniClip(Icons.location_on_outlined, offer.location ?? 'Algiers'),
                  const SizedBox(width: 12),
                  _miniClip(Icons.work_outline, offer.type ?? 'PFE'),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: offer.technologies.take(4).map((s) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  child: Text(s, style: const TextStyle(fontSize: 10)),
                )).toList(),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Apply by checking details', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                  Container(
                    height: 32,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: hasAlreadyApplied ? Colors.grey.withOpacity(0.2) : AppTheme.success.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(hasAlreadyApplied ? 'Applied' : 'Apply', 
                          style: TextStyle(color: hasAlreadyApplied ? Colors.grey : AppTheme.success, fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _miniClip(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppTheme.textMuted),
        const SizedBox(width: 4),
        Text(text, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
      ],
    );
  }

  Widget _infoTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }

  Future<void> _apply(OfferModel offer, String coverLetterText) async {
    setState(() => _applyingId = offer.id);
    try {
      await _api.post('/applications', data: {
        'offerId': offer.id,
        'coverLetter': coverLetterText.isNotEmpty ? coverLetterText : 'Interested in this role.',
      });
      setState(() => _appliedOfferIds.add(offer.id));
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Success! 🎉'), backgroundColor: AppTheme.success));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to apply.'), backgroundColor: AppTheme.danger));
    } finally {
      setState(() => _applyingId = null);
    }
  }

  void _showOfferDetails(OfferModel offer) {
    final coverLetterCtrl = TextEditingController();
    bool localApplying = false;
    final hasAlreadyApplied = _appliedOfferIds.contains(offer.id);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, top: 20, left: 20, right: 20),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Offer Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(offer.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text(offer.companyName, style: const TextStyle(color: AppTheme.primary, fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _infoTag('📍 ${offer.location ?? "Algiers"}', Colors.green),
                    _infoTag('📋 ${offer.type ?? "PFE"}', Colors.blue),
                    _infoTag('⏱️ ${offer.duration ?? "4 Months"}', Colors.pink),
                  ],
                ),
                const SizedBox(height: 20),
                const Text('About the Internship', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(offer.description, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.5)),
                const SizedBox(height: 20),
                const Text('Required Skills', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: offer.technologies.map((s) => Chip(label: Text(s, style: const TextStyle(fontSize: 10)))).toList(),
                ),
                const SizedBox(height: 24),
                if (!hasAlreadyApplied) ...[
                  TextField(
                    controller: coverLetterCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(hintText: 'Add a cover letter...'),
                  ),
                  const SizedBox(height: 16),
                ],
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: (localApplying || hasAlreadyApplied) ? null : () async {
                      setModalState(() => localApplying = true);
                      await _apply(offer, coverLetterCtrl.text.trim());
                      setModalState(() => localApplying = false);
                      Navigator.pop(ctx);
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: hasAlreadyApplied ? Colors.grey : AppTheme.success),
                    child: localApplying ? const CircularProgressIndicator(color: Colors.white) : Text(hasAlreadyApplied ? 'Already Applied' : 'Apply Now'),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
