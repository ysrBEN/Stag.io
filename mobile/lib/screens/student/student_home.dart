import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/theme_provider.dart';
import '../admin/admin_notifications_screen.dart'; 
import 'internship_search_screen.dart';
import 'my_applications_screen.dart';
import 'student_profile_screen.dart';
import 'student_dashboard_screen.dart';
import '../../core/app_theme.dart';

import '../../widgets/brand_logo.dart';

class StudentHome extends StatefulWidget {
  const StudentHome({super.key});

  @override
  State<StudentHome> createState() => _StudentHomeState();
}

class _StudentHomeState extends State<StudentHome> {
  int _currentIndex = 0;

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return const StudentDashboardScreen();
      case 1:
        return const InternshipSearchScreen();
      case 2:
        return const MyApplicationsScreen();
      case 3:
        return const StudentProfileScreen();
      default:
        return const StudentDashboardScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final theme = context.read<ThemeProvider>();

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const BrandLogo(role: 'student', size: 24),
        actions: [
          IconButton(
            icon: Icon(Theme.of(context).brightness == Brightness.dark ? Icons.light_mode : Icons.dark_mode),
            onPressed: () => theme.toggleTheme(),
            tooltip: 'Toggle Theme',
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminNotificationsScreen())),
            tooltip: 'Notifications',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await auth.logout();
            },
            tooltip: 'Logout',
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.search_outlined), activeIcon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.folder_outlined), activeIcon: Icon(Icons.folder), label: 'Applications'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outlined), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
