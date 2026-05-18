import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _stats;
  List<dynamic> _pendingValidations = [];
  List<dynamic> _recentlyValidated = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final responses = await Future.wait([
        _api.get('/admin/stats'),
        _api.get('/admin/internships/pending'),
      ]);
      
      final allInternships = responses[1].data as List;
      
      setState(() {
        _stats = responses[0].data;
        _pendingValidations = allInternships.where((i) => i['status'] != 'validated').take(5).toList();
        _recentlyValidated = allInternships.where((i) => i['status'] == 'validated').take(5).toList();
        _loading = false;
      });
    } catch (e) {
      debugPrint("LOAD DASHBOARD ERROR: $e");
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Admin Dashboard', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const Text('Overview of students, companies, and internship validations', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
            const SizedBox(height: 24),
            
            // Stats Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: [
                _statCard('Total Students', _stats?['totalStudents'] ?? 0, Icons.school, Colors.blue),
                _statCard('Total Companies', _stats?['totalCompanies'] ?? 0, Icons.business, Colors.purple),
                _statCard('Validated', _stats?['totalInternships'] ?? 0, Icons.check_circle, Colors.green),
                _statCard('Pending', _stats?['pendingApprovals'] ?? 0, Icons.hourglass_empty, Colors.orange),
              ],
            ),
            
            const SizedBox(height: 32),
            _buildTableHeader("Pending Validations", _pendingValidations.length),
            _buildValidationsTable(_pendingValidations, isPending: true),
            
            const SizedBox(height: 32),
            _buildTableHeader("Recently Validated", _recentlyValidated.length),
            _buildValidationsTable(_recentlyValidated, isPending: false),
            
            const SizedBox(height: 32),
            const Text('Application Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            _buildApplicationStatusChart(),
            
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String label, dynamic value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text('$value', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        ],
      ),
    );
  }

  Widget _buildTableHeader(String title, int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
              child: Text('$count', style: const TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        TextButton(onPressed: () {}, child: const Text("View All", style: TextStyle(fontSize: 12))),
      ],
    );
  }

  Widget _buildValidationsTable(List<dynamic> items, {required bool isPending}) {
    if (items.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        width: double.infinity,
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.02), borderRadius: BorderRadius.circular(12)),
        child: Text(
          isPending ? "No pending validations at the moment." : "No validated internships yet.",
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: items.map((item) {
          final student = item['student'] ?? {};
          final company = item['offer']?['company'] ?? {};
          final name = "${student['firstName'] ?? ''} ${student['lastName'] ?? ''}".trim();
          
          return ListTile(
            dense: true,
            title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text("${company['name'] ?? 'Company'} • ${item['offer']?['title'] ?? 'Intern'}", style: const TextStyle(fontSize: 11)),
            trailing: Text(isPending ? "Pending" : "Validated", style: TextStyle(color: isPending ? Colors.orange : Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildApplicationStatusChart() {
    final dist = (_stats?['statusDist'] as List?) ?? [];
    final colors = {
      'accepted': Colors.blue,
      'pending': Colors.orange,
      'rejected': Colors.red,
      'validated': Colors.green,
    };

    if (dist.isEmpty) return const SizedBox(height: 100, child: Center(child: Text("No status data")));

    return AspectRatio(
      aspectRatio: 1.5,
      child: PieChart(
        PieChartData(
          sectionsSpace: 4,
          centerSpaceRadius: 40,
          sections: dist.map((e) {
            final status = e['status'] ?? 'pending';
            final count = (e['count'] ?? 0).toDouble();
            return PieChartSectionData(
              color: colors[status] ?? Colors.grey, 
              value: count, 
              title: status.toString().substring(0, 3), 
              radius: 50, 
              titleStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)
            );
          }).toList(),
        ),
      ),
    );
  }
}
