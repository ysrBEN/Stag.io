// This is a basic Flutter widget test.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:stagio_mobile/main.dart';
import 'package:stagio_mobile/core/auth_provider.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      ChangeNotifierProvider(
        create: (_) => AuthProvider(),
        child: const StagioApp(),
      ),
    );
    // App should render without crashing
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
