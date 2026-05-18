// ============================================================
// app_theme.dart - App-wide theme (colors, typography)
// ============================================================
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand colors
  static const Color primary = Color(0xFF4F46E5);      // Indigo
  static const Color primaryDark = Color(0xFF3730A3);
  static const Color accent = Color(0xFF06B6D4);        // Cyan
  static const Color success = Color(0xFF10B981);       // Green
  static const Color warning = Color(0xFFF59E0B);       // Amber
  static const Color danger = Color(0xFFEF4444);        // Red
  static const Color surface = Color(0xFF1E1B4B);       // Deep indigo bg
  static const Color cardBg = Color(0xFF312E81);
  static const Color textLight = Color(0xFFF1F5F9);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color logoTeal = Color(0xFF2DD4BF); // Matches generated logo

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF0F0E2A),
      colorScheme: ColorScheme.dark(
        primary: primary,
        secondary: accent,
        surface: const Color(0xFF1A1740),
        error: danger,
      ),
      textTheme: GoogleFonts.poppinsTextTheme(
        ThemeData.dark().textTheme,
      ).apply(bodyColor: textLight, displayColor: textLight),
      appBarTheme: AppBarTheme(
        backgroundColor: const Color(0xFF0F0E2A),
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.poppins(
          color: textLight,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: const IconThemeData(color: textLight),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
          textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1E1B4B),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF3730A3)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF3730A3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primary, width: 2),
        ),
        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
        hintStyle: const TextStyle(color: Color(0xFF64748B)),
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF1E1B4B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 4,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF0F0E2A),
        selectedItemColor: primary,
        unselectedItemColor: Color(0xFF64748B),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: const Color(0xFF312E81),
        labelStyle: const TextStyle(color: textLight, fontSize: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primary,
      scaffoldBackgroundColor: Colors.white,
      colorScheme: ColorScheme.light(
        primary: primary,
        secondary: accent,
        surface: const Color(0xFFF8FAFC),
        error: danger,
      ),
      textTheme: GoogleFonts.poppinsTextTheme(
        ThemeData.light().textTheme,
      ).apply(bodyColor: const Color(0xFF1E293B), displayColor: const Color(0xFF1E293B)),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.poppins(
          color: const Color(0xFF1E293B),
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: primary,
        unselectedItemColor: Color(0xFF64748B),
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
