import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/app_theme.dart';

class UserApprovalsScreen extends StatefulWidget {
  const UserApprovalsScreen({super.key});

  @override
  State<UserApprovalsScreen> createState() => _UserApprovalsScreenState();
}

class _UserApprovalsScreenState extends State<UserApprovalsScreen> with SingleTickerProviderStateMixin {
  final _api = ApiService();
  late TabController _tabController;
  List<dynamic> _users = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) _fetchUsers();
    });
    _fetchUsers();
  }

  String get _currentStatus {
    switch (_tabController.index) {
      case 1: return 'approved';
      case 2: return 'rejected';
      default: return 'pending';
    }
  }

  Future<void> _fetchUsers() async {
    setState(() => _loading = true);
    try {
      final res = await _api.get('/admin/users', queryParams: {'status': _currentStatus});
      setState(() {
        _users = res.data is List ? res.data : [];
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _updateStatus(String userId, String action) async {
    try {
      final endpoint = action == 'approve' ? '/admin/users/$userId/approve' : '/admin/users/$userId/reject';
      await _api.put(endpoint, data: {});
      _fetchUsers();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('User $action' + 'd')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Action failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: null,
        toolbarHeight: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          tabs: const [
            Tab(text: 'Pending'),
            Tab(text: 'Approved'),
            Tab(text: 'Rejected'),
          ],
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _fetchUsers,
              child: _loading 
                ? const Center(child: CircularProgressIndicator())
                : _users.isEmpty 
                  ? const Center(child: Text("No users found", style: TextStyle(color: AppTheme.textMuted)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _users.length,
                      itemBuilder: (context, i) => _userCard(_users[i]),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        onChanged: (v) => setState(() => _search = v),
        decoration: InputDecoration(
          hintText: 'Search by name or email...',
          prefixIcon: const Icon(Icons.search),
          contentPadding: const EdgeInsets.symmetric(vertical: 12),
        ),
      ),
    );
  }

  Widget _userCard(dynamic user) {
    final role = user['role'] ?? 'student';
    final name = (user['name'] ?? user['companyName'] ?? 'Unknown').toString();
    final email = (user['email'] ?? '').toString();
    
    // Filter by search locally
    if (_search.isNotEmpty && !name.toLowerCase().contains(_search.toLowerCase()) && !email.toLowerCase().contains(_search.toLowerCase())) {
      return const SizedBox.shrink();
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: CircleAvatar(
                backgroundColor: AppTheme.primary.withOpacity(0.1),
                child: Icon(role == 'company' ? Icons.business : Icons.school, color: AppTheme.primary, size: 20),
              ),
              title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Text(email, style: const TextStyle(fontSize: 11)),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(10)),
                child: Text(role.toUpperCase(), style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
              ),
            ),
            if (_tabController.index == 0) // Only show actions for Pending
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => _updateStatus(user['_id'], 'reject'),
                    style: TextButton.styleFrom(foregroundColor: Colors.red),
                    child: const Text("Reject"),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => _updateStatus(user['_id'], 'approve'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                    child: const Text("Approve", style: TextStyle(fontSize: 12)),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
