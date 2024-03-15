import { StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <button onClick={mytest}>hello</button>
      <button onClick={getStats}>get elo</button>
      {/* table here: f_name, l_name, elo, wins, losses */}
    </View>
  );
}

async function getStats() {
  let values = await api('http://127.0.0.1:5000/get-elo')
  console.log(values)
}

async function mytest() {
  console.log("in ping")
  const myTemp = await api('http://127.0.0.1:5000/ping')
  console.log(myTemp)
}

async function api<T>(url: string): Promise<T> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<T>
    })
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
