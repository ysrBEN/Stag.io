// ============================================================
// student_dashboard_screen.dart
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/app_theme.dart';
import '../../core/api_service.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final res = await _api.get('/students/stats');
      setState(() { _stats = res.data; _loading = false; });
    } catch (_) {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return RefreshIndicator(
      onRefresh: _loadStats,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting block
            Text('Welcome back, ${auth.name?.split(' ')[0] ?? 'Student'} 👋', 
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const Text("Here's what's happening with your internship search", 
                style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
            const SizedBox(height: 24),

            // Main stats in a row/grid
            _buildStatsSection(),

            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Applications', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                TextButton(onPressed: () {}, child: const Text('View All', style: TextStyle(fontSize: 12))),
              ],
            ),
            _buildRecentApplications(),

            const SizedBox(height: 24),
            _buildBestMatchesCard(),
            
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    final stats = _stats ?? {'total': 0, 'pending': 0, 'accepted': 0, 'validated': 0, 'rejected': 0};
    final items = [
      {'label': 'Sent', 'value': stats['total'], 'color': Colors.blue, 'icon': Icons.send},
      {'label': 'Accepted', 'value': (stats['accepted'] ?? 0) + (stats['validated'] ?? 0), 'color': Colors.green, 'icon': Icons.check_circle},
      {'label': 'Pending', 'value': stats['pending'], 'color': Colors.orange, 'icon': Icons.hourglass_top},
      {'label': 'Refused', 'value': stats['rejected'], 'color': Colors.red, 'icon': Icons.cancel},
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: items.map((item) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: (item['color'] as Color).withOpacity(0.2)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Icon(item['icon'] as IconData, color: item['color'] as Color, size: 18),
                const SizedBox(width: 8),
                Text(item['label'] as String, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w500)),
              ],
            ),
            const SizedBox(height: 8),
            Text('${item['value']}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          ],
        ),
      )).toList(),
    );
  }

  Widget _buildRecentApplications() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: const Center(
        child: Column(
          children: [
            Icon(Icons.folder_open, color: AppTheme.textMuted, size: 32),
            SizedBox(height: 8),
            Text('No applications found.', style: TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  Widget _buildBestMatchesCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary.withOpacity(0.8), const Color(0xFF4F46E5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: AppTheme.primary.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Text('🎯', style: TextStyle(fontSize: 24)),
              SizedBox(width: 8),
              Text('Best Matches for You', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          const Text('Scale your matching', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          const Text('Add skills to your profile to see personalized internship matches!', 
              style: TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: AppTheme.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
            child: const Text('Complete Profile →', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
