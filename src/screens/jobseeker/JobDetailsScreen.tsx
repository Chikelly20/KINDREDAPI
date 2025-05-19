import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobSeekerStackParamList } from '../../types/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

type Props = NativeStackScreenProps<JobSeekerStackParamList, 'JobDetails'>;

const JobDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const { theme } = useTheme();
  const [job, setJob] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleApply = () => {
    if (job) {
      navigation.navigate('Chat', { jobId: job.id, employerId: job.employerId });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Job not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{job.title}</Text>
          <Text style={[styles.company, { color: theme.text }]}>{job.employerName}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{job.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{job.salary}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{job.workingHours}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>{job.workingDays}</Text>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Description</Text>
          <Text style={[styles.description, { color: theme.text }]}>{job.description}</Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Information</Text>
          <Text style={[styles.contactInfo, { color: theme.text }]}>{job.contactInfo}</Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.applyButton, { backgroundColor: theme.primary }]}
        onPress={handleApply}
      >
        <Text style={[styles.applyButtonText, { color: theme.secondary }]}>
          Apply Now
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  company: {
    fontSize: 18,
    marginBottom: 16,
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  descriptionSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactSection: {
    padding: 20,
    paddingBottom: 100, // Extra padding for the apply button
  },
  contactInfo: {
    fontSize: 16,
    lineHeight: 24,
  },
  applyButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default JobDetailsScreen;
