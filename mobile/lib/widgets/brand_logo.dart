import 'package:flutter/material.dart';
import '../core/app_theme.dart';

class BrandLogo extends StatelessWidget {
  final String role;
  final double size;
  final bool showText;
  final Color? color;

  const BrandLogo({
    super.key,
    required this.role,
    this.size = 28,
    this.showText = true,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    IconData icon;
    switch (role.toLowerCase()) {
      case 'admin':
        icon = Icons.verified_user_rounded;
        break;
      case 'student':
        icon = Icons.school_rounded;
        break;
      case 'company':
        icon = Icons.business_rounded;
        break;
      default:
        icon = Icons.school_rounded;
    }

    final brandColor = color ?? AppTheme.primary;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: brandColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: brandColor,
            size: size,
          ),
        ),
        if (showText) ...[
          const SizedBox(width: 10),
          Text(
            'Stag.io',
            style: TextStyle(
              fontSize: size * 0.75,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
              color: Theme.of(context).textTheme.titleLarge?.color,
            ),
          ),
        ],
      ],
    );
  }
}
