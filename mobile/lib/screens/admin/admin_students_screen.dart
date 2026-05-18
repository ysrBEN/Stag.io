// ============================================================
// admin_students_screen.dart - Admin Students Management
// ============================================================
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';

class AdminStudentsScreen extends StatefulWidget {
  const AdminStudentsScreen({super.key});

  @override
  State<AdminStudentsScreen> createState() => _AdminStudentsScreenState();
}

class _AdminStudentsScreenState extends State<AdminStudentsScreen> {
  final _api = ApiService();
  List<dynamic> _students = [];
  List<dynamic> _filtered = [];
  bool _loading = true;
  String _search = '';
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    try {
      final res = await _api.get('/admin/students');
      setState(() {
        _students = res.data;
        _applyFilters();
        _loading = false;
      });
    } catch (e) {
      debugPrint("FETCH STUDENTS ERROR: $e");
      if (mounted) setState(() => _loading = false);
    }
  }

  void _applyFilters() {
    setState(() {
      _filtered = _students.where((s) {
        final name = "${s['firstName'] ?? ''} ${s['lastName'] ?? ''}".toLowerCase();
        final email = (s['user']?['email'] ?? '').toLowerCase();
        final q = _search.toLowerCase();
        
        final matchSearch = q.isEmpty || name.contains(q) || email.contains(q);
        final matchStatus = _statusFilter == 'all' || 
          (_statusFilter == 'placed' ? (s['placed'] == true) : (s['placed'] != true));
        
        return matchSearch && matchStatus;
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
                ? const Center(child: Text("No students found", style: TextStyle(color: AppTheme.textMuted)))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filtered.length,
                    itemBuilder: (context, i) => _buildStudentCard(_filtered[i]),
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
      child: Column(
        children: [
          TextField(
            onChanged: (v) { _search = v; _applyFilters(); },
            decoration: InputDecoration(
              hintText: 'Search by name or email...',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Colors.black.withOpacity(0.1),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: ['all', 'placed', 'unplaced'].map((f) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(f.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                selected: _statusFilter == f,
                onSelected: (val) { if (val) { _statusFilter = f; _applyFilters(); } },
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentCard(Map<String, dynamic> s) {
    final name = "${s['firstName'] ?? ''} ${s['lastName'] ?? ''}".trim();
    final placed = s['placed'] == true;

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
                CircleAvatar(
                  backgroundColor: AppTheme.primary,
                  child: Text(name.isNotEmpty ? name[0] : 'U', style: const TextStyle(color: Colors.white)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(s['user']?['email'] ?? 'N/A', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: placed ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: placed ? Colors.green.withOpacity(0.3) : Colors.orange.withOpacity(0.3)),
                  ),
                  child: Text(
                    placed ? "PLACED" : "SEARCHING",
                    style: TextStyle(color: placed ? Colors.green : Colors.orange, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const Divider(height: 32),
            _buildDetailRow(Icons.school_outlined, s['university'] ?? 'Not specified'),
            const SizedBox(height: 8),
            _buildDetailRow(Icons.book_outlined, "${s['fieldOfStudy'] ?? 'N/A'} (${s['academicYear'] ?? 'N/A'})"),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              children: ((s['skills'] as List?) ?? []).take(5).map((sk) => Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(4)),
                child: Text(sk.toString(), style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppTheme.textMuted),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(fontSize: 13)),
      ],
    );
  }
}
