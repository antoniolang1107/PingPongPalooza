import { Button, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Text, View } from '../../components/Themed';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ping Pong Palooza</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <p>Add Picture</p>
      <Link href={'/(tabs)/record_match'} asChild>
        <Pressable>
          <button>Log Match</button>
        </Pressable>
      </Link>
      <br/>
      <Link href={'/(tabs)/leaderboard'} asChild>
        <Pressable>
          <button>View Rankings</button>
        </Pressable>
      </Link>
      <br/>
      <Link href={'/(tabs)/register'} asChild>
        <Pressable>
          <button>New Player</button>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
