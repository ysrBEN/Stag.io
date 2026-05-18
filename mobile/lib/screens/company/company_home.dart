// ============================================================
// company_home.dart - Company Bottom Nav Shell (4 Tabs)
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth_provider.dart';
import '../../core/theme_provider.dart';
import '../../core/app_theme.dart';
import '../../widgets/brand_logo.dart';
import '../admin/admin_notifications_screen.dart';
import 'candidates_screen.dart';
import 'company_dashboard_screen.dart';
import 'company_profile_screen.dart';
import 'my_offers_screen.dart';

class CompanyHome extends StatefulWidget {
  const CompanyHome({super.key});

  @override
  State<CompanyHome> createState() => _CompanyHomeState();
}

class _CompanyHomeState extends State<CompanyHome> {
  int _currentIndex = 0;

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return const CompanyDashboardScreen();
      case 1:
        return const MyOffersScreen();
      case 2:
        return const CandidatesScreen();
      case 3:
        return const CompanyProfileScreen();
      default:
        return const CompanyDashboardScreen();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.read<AuthProvider>();
    final theme = context.read<ThemeProvider>();

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const BrandLogo(role: 'company', size: 24),
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
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.work_outline),
            activeIcon: Icon(Icons.work),
            label: 'My Offers',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.people_outline),
            activeIcon: Icon(Icons.people),
            label: 'Candidates',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.business_outlined),
            activeIcon: Icon(Icons.business),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
