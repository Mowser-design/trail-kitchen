import React from 'react';
import { format } from 'date-fns';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';
import { Trip } from '../types';
import { formatWeight } from '../utils/units';
import { sortMealTypes } from '../utils/mealOrder';

interface TripPDFProps {
  trip: Trip;
  unitSystem: 'metric' | 'imperial';
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 20,
  },
  brandName: {
    fontSize: 24,
    color: '#059669', // emerald-600
    fontWeight: 'bold',
  },
  website: {
    fontSize: 12,
    color: '#059669', // emerald-600
    textDecoration: 'none',
  },
  tripInfo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: '#064e3b', // emerald-900
  },
  dates: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  notes: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 12,
    marginBottom: 4,
    color: '#374151',
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 10,
    color: '#4b5563',
  },
  day: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 8,
  },
  dayNumber: {
    fontSize: 18,
    color: '#059669', // emerald-600
    fontWeight: 'bold',
  },
  dayDate: {
    fontSize: 14,
    color: '#374151',
  },
  dayStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: '#4b5563',
  },
  mealSection: {
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
  },
  breakfast: {
    backgroundColor: '#fef3c7', // amber-50
  },
  lunch: {
    backgroundColor: '#ecfdf5', // emerald-50
  },
  dinner: {
    backgroundColor: '#eef2ff', // indigo-50
  },
  snack: {
    backgroundColor: '#fff1f2', // rose-50
  },
  drink: {
    backgroundColor: '#f0f9ff', // sky-50
  },
  mealType: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
  meal: {
    marginBottom: 8,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
  },
  mealName: {
    fontSize: 12,
    color: '#111827',
    fontWeight: 'bold',
  },
  mealDetails: {
    fontSize: 10,
    color: '#4b5563',
    marginTop: 2,
  },
});

export function TripPDF({ trip, unitSystem }: TripPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brandName}>Trail Kitchen</Text>
          <Link src="https://www.trailkitchen.io" style={styles.website}>
            www.trailkitchen.io
          </Link>
        </View>

        <View style={styles.tripInfo}>
          <Text style={styles.title}>{trip.name}</Text>
          <Text style={styles.dates}>
            {format(new Date(trip.startDate), 'MMM d')} -{' '}
            {format(new Date(trip.endDate), 'MMM d, yyyy')}
          </Text>
          {trip.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesTitle}>Trip Notes</Text>
              <Text style={styles.notesText}>{trip.notes}</Text>
            </View>
          )}
        </View>

        {trip.days.map((day, index) => {
          const dayCalories = Object.values(day.meals).reduce(
            (sum, meals) => sum + meals.reduce((mealSum, meal) => mealSum + meal.calories, 0),
            0
          );
          const dayWeight = Object.values(day.meals).reduce(
            (sum, meals) => sum + meals.reduce((mealSum, meal) => mealSum + meal.weight, 0),
            0
          );

          return (
            <View key={day.id} style={styles.day}>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayNumber}>Day {index + 1}</Text>
                  <Text style={styles.dayDate}>
                    {format(new Date(day.date), 'EEEE, MMM d')}
                  </Text>
                </View>
              </View>

              <View style={styles.dayStats}>
                <Text style={styles.statText}>
                  {dayCalories.toLocaleString()} calories
                </Text>
                <Text style={styles.statText}>
                  {formatWeight(dayWeight, unitSystem === 'imperial')}
                </Text>
              </View>

              {Object.entries(day.meals)
                .sort(([a], [b]) => sortMealTypes(a, b))
                .map(([type, meals]) => (
                  <View key={type} style={[styles.mealSection, styles[type as keyof typeof styles]]}>
                    <Text style={styles.mealType}>{type}</Text>
                    {meals.map((meal) => (
                      <View key={meal.id} style={styles.meal}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealDetails}>
                          {formatWeight(meal.weight, unitSystem === 'imperial')} · {meal.calories.toLocaleString()} cal
                          {meal.description && ` · ${meal.description}`}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}