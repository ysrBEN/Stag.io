// ============================================================
// my_offers_screen.dart - Complete Offers Management Screen
// ============================================================
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';
import '../../core/constants.dart';
import '../../models/offer_model.dart';
import 'candidates_screen.dart';

class MyOffersScreen extends StatefulWidget {
  const MyOffersScreen({super.key});

  @override
  State<MyOffersScreen> createState() => _MyOffersScreenState();
}

class _MyOffersScreenState extends State<MyOffersScreen> {
  final _api = ApiService();
  List<OfferModel> _offers = [];
  Map<String, int> _offerAppsCounts = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final offersRes = await _api.get('/company/offers');
      final appsRes = await _api.get('/applications');

      if (!mounted) return;

      final List<OfferModel> parsedOffers = (offersRes.data as List)
          .map((e) => OfferModel.fromJson(e))
          .toList();

      final List<dynamic> apps = appsRes.data is List ? appsRes.data : [];
      final Map<String, int> counts = {};

      for (var o in parsedOffers) {
        counts[o.id] = apps.where((a) {
          final off = a['offer'];
          if (off is Map) return off['_id'] == o.id || off['id'] == o.id;
          return off == o.id;
        }).length;
      }

      setState(() {
        _offers = parsedOffers;
        _offerAppsCounts = counts;
        _loading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _deleteOffer(String id) async {
    try {
      await _api.delete('/company/offers/$id');
      _load();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offer deleted successfully'), backgroundColor: AppTheme.danger),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to delete offer'), backgroundColor: AppTheme.danger),
      );
    }
  }

  void _showDeleteConfirmation(OfferModel offer) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF0F1C2E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            SizedBox(width: 10),
            Text('Delete Offer?', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to delete "${offer.title}"? This action cannot be undone.',
          style: const TextStyle(color: Colors.white70, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteOffer(offer.id);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showFormDialog({OfferModel? offer}) {
    final bool isEdit = offer != null;
    final titleCtrl = TextEditingController(text: offer?.title ?? '');
    final descCtrl = TextEditingController(text: offer?.description ?? '');
    final durationCtrl = TextEditingController(text: offer?.duration ?? '');
    
    String selectedType = offer?.type ?? 'PFE';
    String selectedWorkMode = offer?.workMode ?? 'on-site';
    String? selectedWilaya = offer?.location;
    if (selectedWilaya != null && !AppConstants.algerianWilayas.contains(selectedWilaya)) {
      selectedWilaya = null; // Guard clause
    }

    DateTime? startDate = offer?.startDate != null ? DateTime.tryParse(offer!.startDate!) : null;
    DateTime? endDate = offer?.endDate != null ? DateTime.tryParse(offer!.endDate!) : null;

    final List<String> techSkills = isEdit ? List.from(offer.technologies) : [];
    final skillCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F1C2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
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
                        Text(
                          isEdit ? 'Edit Internship Offer' : 'Create Internship Offer',
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.white60),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const Divider(color: Colors.white10),
                    const SizedBox(height: 12),

                    // Title
                    TextField(
                      controller: titleCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Offer Title',
                        hintText: 'e.g. Frontend Engineering Intern',
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Description
                    TextField(
                      controller: descCtrl,
                      maxLines: 3,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Description',
                        hintText: 'Describe the role and responsibilities...',
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Type Choice
                    const Text('Internship Type', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Row(
                      children: ['PFE', 'Summer', 'Part-time'].map((type) {
                        final isSel = selectedType == type;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(type),
                            selected: isSel,
                            onSelected: (_) => setModalState(() => selectedType = type),
                            selectedColor: AppTheme.primary,
                            backgroundColor: const Color(0xFF162035),
                            labelStyle: TextStyle(
                              color: isSel ? Colors.white : AppTheme.textMuted,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Work Mode Choice
                    const Text('Work Mode', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        {'id': 'on-site', 'label': '🏢 On-site'},
                        {'id': 'remote', 'label': '🏠 Remote'},
                        {'id': 'hybrid', 'label': '🔀 Hybrid'},
                      ].map((mode) {
                        final isSel = selectedWorkMode == mode['id'];
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(mode['label']!),
                            selected: isSel,
                            onSelected: (_) => setModalState(() => selectedWorkMode = mode['id']!),
                            selectedColor: AppTheme.primary,
                            backgroundColor: const Color(0xFF162035),
                            labelStyle: TextStyle(
                              color: isSel ? Colors.white : AppTheme.textMuted,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Wilaya Dropdown
                    DropdownButtonFormField<String>(
                      value: selectedWilaya,
                      dropdownColor: const Color(0xFF0F1C2E),
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(
                        labelText: 'Location (Wilaya)',
                        prefixIcon: Icon(Icons.location_on_outlined, color: AppTheme.primary),
                      ),
                      hint: const Text('Select Wilaya', style: TextStyle(color: AppTheme.textMuted)),
                      items: AppConstants.algerianWilayas.map((w) {
                        return DropdownMenuItem<String>(
                          value: w,
                          child: Text(w),
                        );
                      }).toList(),
                      onChanged: (val) => setModalState(() => selectedWilaya = val),
                    ),
                    const SizedBox(height: 16),

                    // Duration
                    TextField(
                      controller: durationCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: const InputDecoration(
                        labelText: 'Duration',
                        hintText: 'e.g. 3 months',
                        prefixIcon: Icon(Icons.calendar_today_outlined, color: AppTheme.primary),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Start & End Date Pickers
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Start Date', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                              const SizedBox(height: 6),
                              OutlinedButton(
                                onPressed: () async {
                                  final d = await showDatePicker(
                                    context: context,
                                    initialDate: startDate ?? DateTime.now(),
                                    firstDate: DateTime(2020),
                                    lastDate: DateTime(2030),
                                  );
                                  if (d != null) {
                                    setModalState(() => startDate = d);
                                  }
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFF1E293B)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: Center(
                                  child: Text(
                                    startDate != null ? DateFormat('dd/MM/yyyy').format(startDate!) : 'Choose Date',
                                    style: const TextStyle(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('End Date', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                              const SizedBox(height: 6),
                              OutlinedButton(
                                onPressed: () async {
                                  final d = await showDatePicker(
                                    context: context,
                                    initialDate: endDate ?? (startDate ?? DateTime.now()).add(const Duration(days: 30)),
                                    firstDate: startDate ?? DateTime.now(),
                                    lastDate: DateTime(2030),
                                  );
                                  if (d != null) {
                                    setModalState(() => endDate = d);
                                  }
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Color(0xFF1E293B)),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: Center(
                                  child: Text(
                                    endDate != null ? DateFormat('dd/MM/yyyy').format(endDate!) : 'Choose Date',
                                    style: const TextStyle(color: Colors.white, fontSize: 12),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Technologies / Tech Skills
                    const Text('Technologies Needed', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    if (techSkills.isNotEmpty) ...[
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: techSkills.map((skill) => Chip(
                          label: Text(skill, style: const TextStyle(fontSize: 11, color: Colors.white)),
                          backgroundColor: AppTheme.primary.withOpacity(0.2),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: AppTheme.primary)),
                          deleteIcon: const Icon(Icons.close, size: 12, color: Colors.white60),
                          onDeleted: () {
                            setModalState(() => techSkills.remove(skill));
                          },
                        )).toList(),
                      ),
                      const SizedBox(height: 10),
                    ],

                    TextField(
                      controller: skillCtrl,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Type a skill and click Add...',
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.add_circle, color: AppTheme.primary),
                          onPressed: () {
                            final text = skillCtrl.text.trim();
                            if (text.isNotEmpty && !techSkills.contains(text)) {
                              setModalState(() => techSkills.add(text));
                              skillCtrl.clear();
                            }
                          },
                        ),
                      ),
                      onSubmitted: (val) {
                        final text = val.trim();
                        if (text.isNotEmpty && !techSkills.contains(text)) {
                          setModalState(() => techSkills.add(text));
                          skillCtrl.clear();
                        }
                      },
                    ),
                    const SizedBox(height: 30),

                    // Save / Submit Button
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => Navigator.pop(context),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.white24),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            child: const Text('Cancel', style: TextStyle(color: Colors.white70)),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () async {
                              if (titleCtrl.text.trim().isEmpty || descCtrl.text.trim().isEmpty || selectedWilaya == null || startDate == null || endDate == null) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(content: Text('Please fill all required fields'), backgroundColor: AppTheme.danger),
                                );
                                return;
                              }

                              final payload = {
                                'title': titleCtrl.text.trim(),
                                'description': descCtrl.text.trim(),
                                'type': selectedType,
                                'workMode': selectedWorkMode,
                                'location': selectedWilaya,
                                'duration': durationCtrl.text.trim(),
                                'startDate': startDate!.toUtc().toIso8601String(),
                                'endDate': endDate!.toUtc().toIso8601String(),
                                'technologies': techSkills,
                              };

                              try {
                                if (isEdit) {
                                  await _api.put('/offers/${offer.id}', data: payload);
                                } else {
                                  await _api.post('/offers', data: payload);
                                }
                                
                                if (!mounted) return;
                                Navigator.pop(context);
                                _load();
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  SnackBar(
                                    content: Text(isEdit ? 'Offer updated successfully!' : 'Offer published successfully!'),
                                    backgroundColor: AppTheme.success,
                                  ),
                                );
                              } catch (err) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(content: Text('Failed to save offer'), backgroundColor: AppTheme.danger),
                                );
                              }
                            },
                            child: Text(isEdit ? 'Save Changes' : 'Publish Offer'),
                          ),
                        ),
                      ],
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showFormDialog(),
        backgroundColor: AppTheme.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Offer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _offers.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.work_off_outlined, size: 64, color: AppTheme.textMuted),
                      const SizedBox(height: 16),
                      const Text('No offers posted yet', style: TextStyle(color: AppTheme.textMuted, fontSize: 16)),
                      const SizedBox(height: 8),
                      const Text('Create your first internship offer to start finding talent.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                    itemCount: _offers.length,
                    itemBuilder: (_, i) => _offerCard(_offers[i]),
                  ),
                ),
    );
  }

  Widget _offerCard(OfferModel offer) {
    final int appsCount = _offerAppsCounts[offer.id] ?? 0;
    
    // Date formatting helper
    String formattedDates = '';
    if (offer.startDate != null && offer.endDate != null) {
      try {
        final start = DateTime.parse(offer.startDate!).toLocal();
        final end = DateTime.parse(offer.endDate!).toLocal();
        formattedDates = '${DateFormat('dd/MM/yyyy').format(start)} - ${DateFormat('dd/MM/yyyy').format(end)}';
      } catch (_) {}
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF162035),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with edit/delete options
          Row(
            children: [
              Expanded(
                child: Text(
                  offer.title,
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: Colors.white),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.edit_outlined, color: Colors.white70, size: 20),
                onPressed: () => _showFormDialog(offer: offer),
                tooltip: 'Edit',
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20),
                onPressed: () => _showDeleteConfirmation(offer),
                tooltip: 'Delete',
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Horizontal list of tags
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _infoTag('📋 ${offer.type ?? "PFE"}', Colors.blue),
              _infoTag(
                offer.workMode == 'on-site' 
                    ? '🏢 On-site' 
                    : offer.workMode == 'remote' 
                        ? '🏠 Remote' 
                        : '🔀 Hybrid', 
                Colors.purple,
              ),
              _infoTag('📍 ${offer.location ?? "Alger"}', Colors.green),
              _infoTag('⏱️ ${offer.duration ?? "3 Months"}', Colors.pink),
              if (formattedDates.isNotEmpty) _infoTag('📅 $formattedDates', Colors.amber),
            ],
          ),
          const SizedBox(height: 12),

          // Description snippet
          Text(
            offer.description,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
          const SizedBox(height: 12),

          // Technologies wraps
          if (offer.technologies.isNotEmpty) ...[
            Wrap(
              spacing: 4,
              runSpacing: 4,
              children: offer.technologies.map((s) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
                ),
                child: Text(s, style: const TextStyle(color: AppTheme.primary, fontSize: 9, fontWeight: FontWeight.bold)),
              )).toList(),
            ),
            const SizedBox(height: 16),
          ],

          const Divider(color: Colors.white10, height: 1),
          const SizedBox(height: 12),

          // Bottom applicants count & Manage Candidates button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.people_outline, size: 16, color: AppTheme.textMuted),
                  const SizedBox(width: 6),
                  Text(
                    '$appsCount Applicant${appsCount == 1 ? "" : "s"}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CandidatesScreen(offerId: offer.id, offerTitle: offer.title),
                    ),
                  ).then((_) => _load());
                },
                icon: const Icon(Icons.people_outline, size: 14),
                label: const Text('View Candidates', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accent.withOpacity(0.2),
                  foregroundColor: AppTheme.accent,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
