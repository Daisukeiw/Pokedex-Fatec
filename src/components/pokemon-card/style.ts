import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFFCC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  identity: {
    flex: 1,
    gap: 4,
  },
  number: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '700',
  },
  name: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'capitalize',
  },
  image: {
    width: 88,
    height: 88,
  },
  imageFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6B7280',
  },
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  typeText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'column',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  statText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  abilityText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
  },
});
