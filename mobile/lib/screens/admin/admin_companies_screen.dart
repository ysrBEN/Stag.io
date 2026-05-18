// ============================================================
// admin_companies_screen.dart - Admin Companies Management
// ============================================================
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';

class AdminCompaniesScreen extends StatefulWidget {
  const AdminCompaniesScreen({super.key});

  @override
  State<AdminCompaniesScreen> createState() => _AdminCompaniesScreenState();
}

class _AdminCompaniesScreenState extends State<AdminCompaniesScreen> {
  final _api = ApiService();
  List<dynamic> _companies = [];
  List<dynamic> _filtered = [];
  bool _loading = true;
  String _search = '';
  String _wilayaFilter = '';

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final res = await _api.get('/admin/companies');
      setState(() {
        _companies = res.data;
        _applyFilters();
        _loading = false;
      });
    } catch (e) {
      debugPrint("FETCH COMPANIES ERROR: $e");
      if (mounted) setState(() => _loading = false);
    }
  }

  void _applyFilters() {
    setState(() {
      _filtered = _companies.where((c) {
        final name = (c['name'] ?? '').toLowerCase();
        final q = _search.toLowerCase();
        final wilaya = c['location'] ?? '';
        
        final matchSearch = q.isEmpty || name.contains(q);
        final matchWilaya = _wilayaFilter.isEmpty || wilaya == _wilayaFilter;
        
        return matchSearch && matchWilaya;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          _buildFilters(),
          Expanded(
            child: _loading 
              ? const Center(child: CircularProgressIndicator())
              : _filtered.isEmpty 
                ? const Center(child: Text("No companies found", style: TextStyle(color: AppTheme.textMuted)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filtered.length,
                    itemBuilder: (context, i) => _buildCompanyCard(_filtered[i]),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Theme.of(context).cardColor,
      child: TextField(
        onChanged: (v) { _search = v; _applyFilters(); },
        decoration: InputDecoration(
          hintText: 'Search by company name...',
          prefixIcon: const Icon(Icons.search),
          filled: true,
          fillColor: Colors.black.withOpacity(0.1),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        ),
      ),
    );
  }

  Widget _buildCompanyCard(Map<String, dynamic> c) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.white.withOpacity(0.1))),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Center(child: Text(c['name'] != null ? c['name'][0] : 'C', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 18))),
                ),
                const SizedBox(width: 12),
                Expanded(child: Text(c['name'] ?? 'N/A', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16))),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textMuted),
                const SizedBox(width: 6),
                Text(c['location'] ?? 'N/A', style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                const Spacer(),
                if (c['website'] != null && c['website'].isNotEmpty)
                  Text(c['website'], style: const TextStyle(color: AppTheme.primary, fontSize: 11)),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem("Offers", "${c['offerCount'] ?? 0}", Colors.blue),
                _buildStatItem("Placed", "${c['placedCount'] ?? 0}", Colors.green),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(width: 8),
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }
}
