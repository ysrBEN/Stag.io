// ============================================================
// candidates_screen.dart - Complete candidates review dashboard
// ============================================================
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';
import '../../models/offer_model.dart';

class CandidatesScreen extends StatefulWidget {
  final String? offerId;
  final String? offerTitle;

  const CandidatesScreen({super.key, this.offerId, this.offerTitle});

  @override
  State<CandidatesScreen> createState() => _CandidatesScreenState();
}

class _CandidatesScreenState extends State<CandidatesScreen> {
  final _api = ApiService();
  List<OfferModel> _offers = [];
  List<dynamic> _applications = [];
  String? _selectedOfferId;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final offersRes = await _api.get('/company/offers');
      final appsRes = await _api.get('/applications');

      if (!mounted) return;

      final List<OfferModel> parsedOffers = (offersRes.data as List)
          .map((e) => OfferModel.fromJson(e))
          .toList();

      final List<dynamic> parsedApps = appsRes.data is List ? appsRes.data : [];

      setState(() {
        _offers = parsedOffers;
        _applications = parsedApps;

        // Determine which offer is initially selected
        if (widget.offerId != null && widget.offerId!.isNotEmpty) {
          _selectedOfferId = widget.offerId;
        } else if (_offers.isNotEmpty) {
          _selectedOfferId = _offers.first.id;
        }
        
        _loading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _updateStatus(String appId, String status) async {
    try {
      final backendStatus = status == 'refused' ? 'rejected' : 'accepted';
      await _api.put('/applications/$appId', data: {'status': backendStatus});
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Application ${status == 'accepted' ? 'Accepted' : 'Refused'} successfully'),
          backgroundColor: status == 'accepted' ? AppTheme.success : AppTheme.danger,
        ),
      );
      _loadData();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Action failed. The student might be placed elsewhere.'), backgroundColor: AppTheme.danger),
      );
    }
  }

  void _showCoverLetter(BuildContext context, String name, String coverLetter) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F1C2E),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            top: 20,
            left: 20,
            right: 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    "Cover Letter — $name",
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white60),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(color: Colors.white10),
              const SizedBox(height: 12),
              Container(
                constraints: const BoxConstraints(maxHeight: 300),
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E3A5F).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: SingleChildScrollView(
                  child: Text(
                    coverLetter.isNotEmpty ? coverLetter : "No cover letter provided.",
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      height: 1.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  void _showConventionDialog(BuildContext context, dynamic app) {
    final student = app['student'] ?? {};
    final String firstName = student['firstName'] ?? '';
    final String lastName = student['lastName'] ?? '';
    final String studentName = '$firstName $lastName'.trim();
    final String university = student['university'] ?? 'University';
    final String academicYear = student['academicYear'] ?? 'Year';
    final String validatedDate = app['validatedAt'] != null 
        ? DateTime.parse(app['validatedAt']).toLocal().toString().split(' ')[0]
        : 'N/A';

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF0F1C2E),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.assignment_turned_in, color: AppTheme.accent, size: 24),
            SizedBox(width: 10),
            Text('Convention de Stage', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Divider(color: Colors.white10),
            const SizedBox(height: 8),
            _dialogRow('Student Name', studentName),
            _dialogRow('University', university),
            _dialogRow('Academic Year', academicYear),
            _dialogRow('Status', 'University Validated 🎓'),
            _dialogRow('Validated On', validatedDate),
            const SizedBox(height: 16),
            const Text(
              'Official PDF generated successfully. Access and download the print version on the Stag.io Web Platform.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontStyle: FontStyle.italic),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: AppTheme.accent)),
          ),
        ],
      ),
    );
  }

  Widget _dialogRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isSingleView = widget.offerId != null && widget.offerId!.isNotEmpty;
    
    final content = _loading
        ? const Center(child: CircularProgressIndicator())
        : _offers.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.people_outline, size: 64, color: AppTheme.textMuted),
                    const SizedBox(height: 16),
                    const Text('No offers posted yet', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('You must post an offer first to see incoming student candidates.', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                  ],
                ),
              )
            : Column(
                children: [
                  // Tab Selector of Offers (only shown in TabView / when no single offerId is supplied)
                  if (!isSingleView) ...[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Review Candidates',
                            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Select an offer to review incoming student applications',
                            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      height: 52,
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _offers.length,
                        itemBuilder: (context, index) {
                          final offer = _offers[index];
                          final isSelected = offer.id == _selectedOfferId;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: ChoiceChip(
                              label: Text(offer.title),
                              selected: isSelected,
                              onSelected: (_) {
                                setState(() => _selectedOfferId = offer.id);
                              },
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : AppTheme.textMuted,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                fontSize: 12,
                              ),
                              selectedColor: AppTheme.primary,
                              backgroundColor: const Color(0xFF162035),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                                side: BorderSide(
                                  color: isSelected ? AppTheme.primary : const Color(0xFF1E293B),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],

                  // Selected Candidates List
                  Expanded(
                    child: _buildCandidatesList(),
                  ),
                ],
              );

    if (isSingleView) {
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.offerTitle ?? 'Candidates'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: content,
      );
    }

    return content;
  }

  Widget _buildCandidatesList() {
    final filteredApps = _applications.where((app) {
      final offer = app['offer'];
      if (offer is Map) {
        return offer['_id'] == _selectedOfferId || offer['id'] == _selectedOfferId;
      }
      return offer == _selectedOfferId;
    }).toList();

    if (filteredApps.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.group_off_outlined, size: 60, color: AppTheme.textMuted),
            const SizedBox(height: 12),
            const Text(
              'No candidates applied for this offer yet.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 14),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: filteredApps.length,
        itemBuilder: (context, index) {
          final app = filteredApps[index];
          final student = app['student'] ?? {};
          final String firstName = student['firstName'] ?? '';
          final String lastName = student['lastName'] ?? '';
          final String studentName = '$firstName $lastName'.trim().isEmpty ? 'Student' : '$firstName $lastName';
          final String university = student['university'] ?? 'University';
          final String academicYear = student['academicYear'] ?? 'Year';
          final String field = student['fieldOfStudy'] ?? 'Field of Study';
          final String status = app['status'] ?? 'pending';
          final String coverLetter = app['coverLetter'] ?? '';
          final bool hasOverlap = app['hasOverlap'] ?? false;
          final String appId = app['_id'] ?? app['id'] ?? '';
          final List<String> studentSkills = List<String>.from(student['skills'] ?? []);

          final initial = studentName.isNotEmpty ? studentName[0].toUpperCase() : 'S';

          Color statusColor = AppTheme.warning;
          if (status == 'accepted') statusColor = AppTheme.success;
          if (status == 'validated') statusColor = AppTheme.accent;
          if (status == 'refused' || status == 'rejected') statusColor = AppTheme.danger;

          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF162035),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: hasOverlap ? Colors.redAccent.withOpacity(0.4) : const Color(0xFF1E293B),
                width: hasOverlap ? 1.5 : 1.0,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Overlap Warning Banner
                if (hasOverlap) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: Colors.redAccent.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 16),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Student already placed for these dates',
                            style: TextStyle(color: Colors.redAccent, fontSize: 10, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Candidate Bio Block
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: Colors.purple.withOpacity(0.2),
                      child: Text(initial, style: const TextStyle(color: Colors.purpleAccent, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(studentName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                          const SizedBox(height: 2),
                          Text('$university — $academicYear', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                          Text(field, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        status.toUpperCase(),
                        style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                      ),
                    ),
                  ],
                ),

                // Technologies/Skills
                if (studentSkills.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 4,
                    runSpacing: 4,
                    children: studentSkills.take(5).map((s) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: AppTheme.primary.withOpacity(0.2)),
                      ),
                      child: Text(s, style: const TextStyle(color: AppTheme.primary, fontSize: 9, fontWeight: FontWeight.bold)),
                    )).toList(),
                  ),
                ],

                const SizedBox(height: 16),
                const Divider(color: Colors.white10, height: 1),
                const SizedBox(height: 10),

                // Action buttons: Cover Letter, Accept/Refuse, Convention
                Row(
                  children: [
                    // Cover Letter button
                    ElevatedButton.icon(
                      onPressed: () => _showCoverLetter(context, studentName, coverLetter),
                      icon: const Icon(Icons.description_outlined, size: 14),
                      label: const Text('Cover Letter', style: TextStyle(fontSize: 11)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.1),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                    ),
                    const Spacer(),

                    // If validated show "Convention"
                    if (status == 'validated') ...[
                      ElevatedButton.icon(
                        onPressed: () => _showConventionDialog(context, app),
                        icon: const Icon(Icons.article_outlined, size: 14),
                        label: const Text('Convention', style: TextStyle(fontSize: 11)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accent.withOpacity(0.2),
                          foregroundColor: AppTheme.accent,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                      ),
                    ],

                    // If pending show Accept / Refuse
                    if (status == 'pending') ...[
                      OutlinedButton(
                        onPressed: () => _updateStatus(appId, 'refused'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          side: const BorderSide(color: Colors.redAccent),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        child: const Text('Refuse', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => _updateStatus(appId, 'accepted'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        child: const Text('Accept', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
