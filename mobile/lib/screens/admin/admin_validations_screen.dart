// ============================================================
// admin_validations_screen.dart - Admin Internship Validations
// ============================================================
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';

class AdminValidationsScreen extends StatefulWidget {
  const AdminValidationsScreen({super.key});

  @override
  State<AdminValidationsScreen> createState() => _AdminValidationsScreenState();
}

class _AdminValidationsScreenState extends State<AdminValidationsScreen> {
  final _api = ApiService();
  List<dynamic> _pending = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchValidations();
  }

  Future<void> _fetchValidations() async {
    try {
      final res = await _api.get('/admin/internships/pending');
      setState(() {
        _pending = res.data;
        _loading = false;
      });
    } catch (e) {
      debugPrint("FETCH VALIDATIONS ERROR: $e");
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleAction(String id, String action) async {
    try {
      if (action == 'validate') {
        await _api.put('/admin/internships/$id/validate');
      } else {
        await _api.put('/admin/internships/$id/refuse');
      }
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Internship $action successfully")));
      _fetchValidations();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Action failed")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _loading 
        ? const Center(child: CircularProgressIndicator())
        : _pending.isEmpty 
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.celebration_outlined, size: 64, color: AppTheme.primary),
                  SizedBox(height: 16),
                  Text("All caught up!", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  Text("No pending validations.", style: TextStyle(color: AppTheme.textMuted)),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _pending.length,
              itemBuilder: (context, i) => _buildValidationCard(_pending[i]),
            ),
    );
  }

  Widget _buildValidationCard(Map<String, dynamic> item) {
    final student = item['student'] ?? {};
    final company = item['offer']?['company'] ?? {};
    final offer = item['offer'] ?? {};
    final studentName = "${student['firstName'] ?? ''} ${student['lastName'] ?? ''}".trim();

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.school, color: AppTheme.primary, size: 20),
                const SizedBox(width: 8),
                Text(studentName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 4),
            Text(student['university'] ?? 'University', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
            const Divider(height: 32),
            Text(offer['title'] ?? 'Internship Position', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(company['name'] ?? 'Company Name', style: const TextStyle(color: AppTheme.primary, fontSize: 13, fontWeight: FontWeight.w500)),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on, size: 12, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(company['location'] ?? 'Wilaya', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                const SizedBox(width: 12),
                const Icon(Icons.timer, size: 12, color: AppTheme.textMuted),
                const SizedBox(width: 4),
                Text(offer['duration'] ?? 'N/A', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _handleAction(item['_id'], 'refuse'),
                    child: const Text("REFUSE"),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _handleAction(item['_id'], 'validate'),
                    child: const Text("VALIDATE"),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
