// ============================================================
// company_dashboard_screen.dart - Web-parity Overview
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_service.dart';
import '../../core/auth_provider.dart';
import '../../core/app_theme.dart';
import '../../models/offer_model.dart';

class CompanyDashboardScreen extends StatefulWidget {
  const CompanyDashboardScreen({super.key});

  @override
  State<CompanyDashboardScreen> createState() => _CompanyDashboardScreenState();
}

class _CompanyDashboardScreenState extends State<CompanyDashboardScreen> {
  final _api = ApiService();
  List<OfferModel> _offers = [];
  List<dynamic> _applications = [];
  List<dynamic> _recentApplicants = [];
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

      final List<dynamic> parsedApps = appsRes.data is List ? appsRes.data : [];

      // Sort applications to get last 5 (recent)
      final List<dynamic> sortedApps = List.from(parsedApps);
      sortedApps.sort((a, b) {
        final aDate = DateTime.tryParse(a['createdAt'] ?? '') ?? DateTime.now();
        final bDate = DateTime.tryParse(b['createdAt'] ?? '') ?? DateTime.now();
        return bDate.compareTo(aDate);
      });

      setState(() {
        _offers = parsedOffers;
        _applications = parsedApps;
        _recentApplicants = sortedApps.take(5).toList();
        _loading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _handleAction(String appId, String status) async {
    try {
      final backendStatus = status == 'refused' ? 'rejected' : 'accepted';
      await _api.put('/applications/$appId', data: {'status': backendStatus});
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Applicant ${status == 'accepted' ? 'Accepted' : 'Refused'} successfully'),
          backgroundColor: status == 'accepted' ? AppTheme.success : AppTheme.danger,
        ),
      );
      _load();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to update status'), backgroundColor: AppTheme.danger),
      );
    }
  }

  int _getOfferApplicantsCount(String offerId) {
    return _applications.where((a) {
      final offer = a['offer'];
      if (offer is Map) {
        return offer['_id'] == offerId || offer['id'] == offerId;
      }
      return offer == offerId;
    }).length;
  }

  @override
  Widget build(BuildContext context) {
    final totalOffers = _offers.length;
    final totalApps = _applications.length;
    final pending = _applications.where((a) => a['status'] == 'pending').length;
    final accepted = _applications.where((a) => a['status'] == 'accepted' || a['status'] == 'validated').length;

    return RefreshIndicator(
      onRefresh: _load,
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sleek Welcome Banner
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F1C2E), Color(0xFF1E3A5F)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Dashboard Overview',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(height: 12),
                              ElevatedButton.icon(
                                onPressed: () {
                                  // Navigate to My Offers and show the create dialog
                                },
                                icon: const Icon(Icons.add, size: 16),
                                label: const Text('Post New Offer', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF14B8A6),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFF14B8A6).withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.bar_chart_outlined,
                            color: Color(0xFF14B8A6),
                            size: 26,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Stats Row
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.4,
                    children: [
                      _statCard('Total Offers', totalOffers, Icons.assignment_outlined, Colors.blue),
                      _statCard('Total Applicants', totalApps, Icons.people_outline, Colors.purple),
                      _statCard('Accepted', accepted, Icons.check_circle_outline, Colors.green),
                      _statCard('Pending Reviews', pending, Icons.hourglass_empty_outlined, Colors.amber),
                    ],
                  ),
                  const SizedBox(height: 28),

                  // Two Column sections: Active Offers & Recent Applicants
                  _sectionHeader(
                    context,
                    title: 'Active Offers',
                    icon: Icons.flash_on_outlined,
                    iconColor: const Color(0xFF14B8A6),
                  ),
                  const SizedBox(height: 12),
                  _buildActiveOffersSection(),

                  const SizedBox(height: 28),

                  _sectionHeader(
                    context,
                    title: 'Recent Applicants',
                    icon: Icons.people_outline,
                    iconColor: Colors.purpleAccent,
                  ),
                  const SizedBox(height: 12),
                  _buildRecentApplicantsSection(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }

  Widget _statCard(String label, int value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF162035),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 22),
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
              )
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$value',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: const TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(BuildContext context, {required String title, required IconData icon, required Color iconColor}) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildActiveOffersSection() {
    if (_offers.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF162035),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF1E293B)),
        ),
        child: const Center(
          child: Text(
            'No active offers yet.',
            style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF162035),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _offers.length > 3 ? 3 : _offers.length,
        separatorBuilder: (_, __) => const Divider(color: Color(0xFF1E293B), height: 1),
        itemBuilder: (_, index) {
          final offer = _offers[index];
          final appsCount = _getOfferApplicantsCount(offer.id);
          return ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            title: Text(
              offer.title,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      offer.type ?? 'PFE',
                      style: const TextStyle(color: Colors.blue, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(Icons.location_on_outlined, size: 12, color: Colors.white.withOpacity(0.5)),
                  const SizedBox(width: 2),
                  Text(
                    offer.location ?? 'Alger',
                    style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11),
                  ),
                ],
              ),
            ),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '$appsCount Applicants',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRecentApplicantsSection() {
    if (_recentApplicants.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF162035),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFF1E293B)),
        ),
        child: const Center(
          child: Text(
            'No applications received yet.',
            style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
        ),
      );
    }

    return Column(
      children: _recentApplicants.map((app) {
        final student = app['student'] ?? {};
        final offer = app['offer'] ?? {};
        final String firstName = student['firstName'] ?? '';
        final String lastName = student['lastName'] ?? '';
        final String studentName = '$firstName $lastName'.trim().isEmpty ? 'Student' : '$firstName $lastName';
        final String offerTitle = offer['title'] ?? 'Unknown Position';
        final String status = app['status'] ?? 'pending';
        final String appId = app['_id'] ?? app['id'] ?? '';
        
        final initial = studentName.isNotEmpty ? studentName[0].toUpperCase() : 'S';

        Color badgeBg = Colors.amber.withOpacity(0.15);
        Color badgeText = Colors.amber;
        if (status == 'accepted' || status == 'validated') {
          badgeBg = Colors.green.withOpacity(0.15);
          badgeText = Colors.green;
        } else if (status == 'refused' || status == 'rejected') {
          badgeBg = Colors.red.withOpacity(0.15);
          badgeText = Colors.red;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF162035),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundColor: Colors.purple.withOpacity(0.2),
                    child: Text(initial, style: const TextStyle(color: Colors.purpleAccent, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          studentName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          offerTitle,
                          style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: badgeBg,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      status.toUpperCase(),
                      style: TextStyle(color: badgeText, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                    ),
                  ),
                ],
              ),
              if (status == 'pending') ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _handleAction(appId, 'refused'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          side: const BorderSide(color: Colors.redAccent),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        child: const Text('Refuse', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _handleAction(appId, 'accepted'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                        ),
                        child: const Text('Accept', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        );
      }).toList(),
    );
  }
}
