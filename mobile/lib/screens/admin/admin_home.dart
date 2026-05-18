import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/theme_provider.dart';
import 'admin_dashboard_screen.dart';
import 'user_approvals_screen.dart';
import 'admin_validations_screen.dart';
import 'admin_statistics_screen.dart';
import 'admin_students_screen.dart';
import 'admin_companies_screen.dart';
import 'admin_notifications_screen.dart';
import '../../core/app_theme.dart';

import '../../widgets/brand_logo.dart';

class AdminHome extends StatefulWidget {
  const AdminHome({super.key});

  @override
  State<AdminHome> createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  int _currentIndex = 0;

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return const AdminDashboardScreen();
      case 1:
        return const UserApprovalsScreen();
      case 2:
        return const AdminValidationsScreen();
      case 3:
        return const AdminStatisticsScreen();
      case 4:
        return const AdminStudentsScreen();
      case 5:
        return const AdminCompaniesScreen();
      default:
        return const AdminDashboardScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final theme = context.read<ThemeProvider>();
    
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const BrandLogo(role: 'admin', size: 24),
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
            onPressed: () => auth.logout(),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppTheme.primary,
        unselectedItemColor: AppTheme.textMuted,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.how_to_reg_outlined), activeIcon: Icon(Icons.how_to_reg), label: 'Users'),
          BottomNavigationBarItem(icon: Icon(Icons.check_circle_outline), activeIcon: Icon(Icons.check_circle), label: 'Valid'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart_outlined), activeIcon: Icon(Icons.bar_chart), label: 'Stats'),
          BottomNavigationBarItem(icon: Icon(Icons.school_outlined), activeIcon: Icon(Icons.school), label: 'Studs'),
          BottomNavigationBarItem(icon: Icon(Icons.business_outlined), activeIcon: Icon(Icons.business), label: 'Comps'),
        ],
      ),
    );
  }
}
