import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, shadows, spacing } from '@/src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function AppScreen({
  children,
  scroll = true,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  if (!scroll) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LogoMark({ size = 42 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[colors.accent, colors.accentStrong]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.logoMark, { width: size, height: size, borderRadius: size * 0.3 }]}
    >
      <Ionicons name="football" size={size * 0.56} color={colors.background} />
    </LinearGradient>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Title({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function Body({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon = 'arrow-forward',
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonLabel, secondary && styles.buttonLabelSecondary]}>
        {label}
      </Text>
      <Ionicons
        name={icon}
        size={19}
        color={secondary ? colors.text : colors.background}
      />
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  badge,
}: {
  icon: IconName;
  onPress?: () => void;
  badge?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}>
      <Ionicons name={icon} color={colors.text} size={20} />
      {badge ? <View style={styles.notificationDot} /> : null}
    </Pressable>
  );
}

export function Pill({
  children,
  tone = 'neutral',
  icon,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'warning' | 'blue';
  icon?: IconName;
}) {
  const palette = {
    neutral: { bg: colors.surfaceLight, fg: colors.textSoft },
    accent: { bg: colors.accentDark, fg: colors.accent },
    warning: { bg: '#3A2C13', fg: colors.warning },
    blue: { bg: '#152A46', fg: colors.blue },
  }[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      {icon ? <Ionicons name={icon} size={13} color={palette.fg} /> : null}
      <Text style={[styles.pillText, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: IconName;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={25} color={colors.accent} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 120,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },
  logoMark: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  sectionAction: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    minHeight: 54,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '800',
  },
  buttonLabelSecondary: {
    color: colors.text,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  pill: {
    minHeight: 27,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: 5,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  segmented: {
    padding: 4,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
  },
  segmentItem: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentItemActive: {
    backgroundColor: colors.surfaceLight,
  },
  segmentText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: colors.text,
  },
  emptyState: {
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 7,
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 280,
  },
});
