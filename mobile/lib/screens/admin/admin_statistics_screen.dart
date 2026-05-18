import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';

class AdminStatisticsScreen extends StatefulWidget {
  const AdminStatisticsScreen({super.key});

  @override
  State<AdminStatisticsScreen> createState() => _AdminStatisticsScreenState();
}

class _AdminStatisticsScreenState extends State<AdminStatisticsScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    try {
      final res = await _api.get('/admin/stats');
      setState(() {
        _stats = res.data;
        _loading = false;
      });
    } catch (e) {
      debugPrint("FETCH STATS ERROR: $e");
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Platform Statistics", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const Text("Comprehensive analytics overview of Stag.io", style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
            const SizedBox(height: 24),
            
            // Summary row
            Row(
              children: [
                Expanded(child: _buildSummaryBox('Students', '${_stats?['totalStudents'] ?? 0}', Colors.blue)),
                const SizedBox(width: 12),
                Expanded(child: _buildSummaryBox('Companies', '${_stats?['totalCompanies'] ?? 0}', Colors.purple)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildSummaryBox('Offers', '${_stats?['totalOffers'] ?? 0}', Colors.teal)),
                const SizedBox(width: 12),
                Expanded(child: _buildSummaryBox('Placement', '${_stats?['placementRate'] ?? 0}%', Colors.green)),
              ],
            ),
            
            const SizedBox(height: 32),
            _buildChartHeader("Top 8 Wilayas by Offers Posted"),
            _buildBarChart(),
            
            const SizedBox(height: 32),
            _buildChartHeader("Students Placed vs Searching"),
            _buildPieChart(),
            
            const SizedBox(height: 32),
            _buildChartHeader("Applications Over Time (Monthly)"),
            _buildLineChart(),
            
            const SizedBox(height: 32),
            _buildChartHeader("Top 8 Most Requested Skills"),
            _buildHorizontalBarChart(),
            
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryBox(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        ],
      ),
    );
  }

  Widget _buildChartHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
    );
  }

  Widget _buildBarChart() {
    final list = (_stats?['studentsByWilaya'] as List?) ?? [];
    return SizedBox(
      height: 200,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          borderData: FlBorderData(show: false),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (val, meta) {
                  int i = val.toInt();
                  if (i >= 0 && i < list.length) {
                    return Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(list[i]['wilaya'].toString().substring(0, 3), style: const TextStyle(fontSize: 10)),
                    );
                  }
                  return const SizedBox();
                },
              ),
            ),
            leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          barGroups: list.asMap().entries.map((e) {
            return BarChartGroupData(x: e.key, barRods: [
              BarChartRodData(toY: (e.value['count'] ?? 0).toDouble(), color: Colors.teal, width: 15, borderRadius: BorderRadius.circular(4))
            ]);
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildPieChart() {
    final total = (_stats?['totalStudents'] ?? 0).toDouble();
    final placed = (_stats?['validatedApps'] ?? 0).toDouble();
    final searching = total - placed;

    return SizedBox(
      height: 200,
      child: PieChart(
        PieChartData(
          sections: [
            PieChartSectionData(color: Colors.green, value: placed, title: 'Placed', radius: 60, titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
            PieChartSectionData(color: Colors.blue, value: searching > 0 ? searching : 1, title: 'Search', radius: 60, titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
      ),
    );
  }

  Widget _buildLineChart() {
    final list = (_stats?['appsOverTime'] as List?) ?? [];
    if (list.isEmpty) return const Center(child: Text("No time data available", style: TextStyle(fontSize: 10)));
    
    return SizedBox(
      height: 200,
      child: LineChart(
        LineChartData(
          gridData: const FlGridData(show: false),
          titlesData: const FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: list.map((e) => FlSpot((e['month'] ?? 0).toDouble(), (e['count'] ?? 0).toDouble())).toList(),
              isCurved: true,
              color: AppTheme.primary,
              barWidth: 4,
              dotData: const FlDotData(show: true),
              belowBarData: BarAreaData(show: true, color: AppTheme.primary.withOpacity(0.1)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalBarChart() {
    final list = (_stats?['topSkills'] as List?) ?? [];
    return SizedBox(
      height: 200,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceEvenly,
          borderData: FlBorderData(show: false),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (val, meta) {
                  int i = val.toInt();
                  if (i >= 0 && i < list.length) {
                    return Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(list[i]['skill'].toString().substring(0, 3), style: const TextStyle(fontSize: 9)),
                    );
                  }
                  return const SizedBox();
                },
              ),
            ),
            leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          barGroups: list.asMap().entries.map((e) {
            return BarChartGroupData(x: e.key, barRods: [
              BarChartRodData(toY: (e.value['count'] ?? 0).toDouble(), color: Colors.orange, width: 12, borderRadius: BorderRadius.circular(4))
            ]);
          }).toList(),
        ),
      ),
    );
  }
}
