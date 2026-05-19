// ============================================================
// main.dart - App entry point with role-based routing
// ============================================================
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/auth_provider.dart';
import 'core/theme_provider.dart';
import 'core/app_theme.dart';
import 'screens/auth/login_screen.dart';
import 'screens/student/student_home.dart';
import 'screens/company/company_home.dart';
import 'screens/admin/admin_home.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const StagioApp(),
    ),
  );
}

class StagioApp extends StatefulWidget {
  const StagioApp({super.key});

  @override
  State<StagioApp> createState() => _StagioAppState();
}

class _StagioAppState extends State<StagioApp> {
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await context.read<AuthProvider>().loadFromStorage();
    setState(() => _initialized = true);
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = context.watch<ThemeProvider>();
    
    return MaterialApp(
      title: 'Stag.io',
      debugShowCheckedModeBanner: false,
      themeMode: themeProvider.themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: _initialized ? const _RootRouter() : const _SplashScreen(),
    );
  }
}

// -------------------------------------------------------
// Root Router: shows correct screen based on auth state
// -------------------------------------------------------
class _RootRouter extends StatelessWidget {
  const _RootRouter();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    if (!auth.isLoggedIn) {
      return const LoginScreen();
    }

    switch (auth.role) {
      case 'student':
        return const StudentHome();
      case 'company':
        return const CompanyHome();
      case 'admin':
        return const AdminHome();
      default:
        return const LoginScreen();
    }
  }
}

// -------------------------------------------------------
// Splash screen shown while loading saved session
// -------------------------------------------------------
class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F1C2E), Color(0xFF1E3A5F), Color(0xFF0F1C2E)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: AppTheme.primary),
              const SizedBox(height: 24),
              const Text(
                'Stag.io',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Loading...',
                style: TextStyle(color: AppTheme.textMuted, fontSize: 14),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
