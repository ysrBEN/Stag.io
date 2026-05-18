import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';

class AdminNotificationsScreen extends StatefulWidget {
  const AdminNotificationsScreen({super.key});

  @override
  State<AdminNotificationsScreen> createState() => _AdminNotificationsScreenState();
}

class _AdminNotificationsScreenState extends State<AdminNotificationsScreen> {
  final _api = ApiService();
  List<dynamic> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    try {
      final res = await _api.get('/notifications');
      setState(() {
        _notifications = res.data is List ? res.data : [];
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _markRead(String id) async {
    try {
      await _api.put('/notifications/$id/read', data: {});
      _fetch();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Notifications")),
      body: RefreshIndicator(
        onRefresh: _fetch,
        child: _loading 
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
            ? const Center(child: Text("No notifications", style: TextStyle(color: AppTheme.textMuted)))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _notifications.length,
                itemBuilder: (context, i) {
                  final n = _notifications[i];
                  final isRead = n['isRead'] == true;
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Icon(
                        Icons.notifications, 
                        color: isRead ? AppTheme.textMuted : AppTheme.primary
                      ),
                      title: Text(
                        n['message'] ?? '', 
                        style: TextStyle(
                          fontSize: 13, 
                          fontWeight: isRead ? FontWeight.normal : FontWeight.bold
                        )
                      ),
                      subtitle: Text(
                        n['createdAt']?.toString().substring(0, 10) ?? '',
                        style: const TextStyle(fontSize: 11)
                      ),
                      trailing: !isRead ? IconButton(
                        icon: const Icon(Icons.check, size: 18),
                        onPressed: () => _markRead(n['_id']),
                      ) : null,
                    ),
                  );
                },
              ),
      ),
    );
  }
}
