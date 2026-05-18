// ============================================================
// my_applications_screen.dart
// ============================================================
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';
import 'package:intl/intl.dart';

class MyApplicationsScreen extends StatefulWidget {
  const MyApplicationsScreen({super.key});

  @override
  State<MyApplicationsScreen> createState() => _MyApplicationsScreenState();
}

class _MyApplicationsScreenState extends State<MyApplicationsScreen> {
  final _api = ApiService();
  List<dynamic> _applications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await _api.get('/applications/my');
      setState(() {
        _applications = res.data is List ? res.data : [];
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    return DefaultTabController(
      length: 4,
      child: Column(
        children: [
          Container(
            color: Theme.of(context).appBarTheme.backgroundColor,
            child: const TabBar(
              isScrollable: true,
              tabs: [
                Tab(text: 'All'),
                Tab(text: 'Pending'),
                Tab(text: 'Accepted'),
                Tab(text: 'Refused'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildList(null),
                _buildList('pending'),
                _buildList('accepted'),
                _buildList('rejected'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildList(String? status) {
    final filtered = status == null 
        ? _applications 
        : _applications.where((a) => a['status'] == status).toList();

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.folder_open, size: 64, color: AppTheme.textMuted),
            const SizedBox(height: 16),
            Text('No applications found', style: const TextStyle(color: AppTheme.textMuted)),
            if (status != null)
              Text('You haven\'t applied to any internships yet in this category.', 
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: filtered.length,
        itemBuilder: (_, i) => _appCard(filtered[i]),
      ),
    );
  }

  Widget _appCard(dynamic app) {
    final offer = app['offer'] ?? {};
    final company = offer['company'] ?? {};
    final status = app['status'] ?? 'pending';
    
    Color statusColor = AppTheme.warning;
    if (status == 'accepted' || status == 'validated') statusColor = AppTheme.success;
    if (status == 'rejected') statusColor = AppTheme.danger;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
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
                      Text(offer['title'] ?? 'Internship', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(company['companyName'] ?? company['name'] ?? 'Company', 
                          style: TextStyle(color: AppTheme.primary, fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Text(status.toUpperCase(), style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 6),
                Text('Applied on ${DateFormat('dd MMM yyyy').format(DateTime.parse(app['createdAt']).toLocal())}', 
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
            if (app['refusalReason'] != null) ...[
              const SizedBox(height: 8),
              Text('Note: ${app['refusalReason']}', style: const TextStyle(color: AppTheme.danger, fontSize: 11)),
            ],
          ],
        ),
      ),
    );
  }
}
