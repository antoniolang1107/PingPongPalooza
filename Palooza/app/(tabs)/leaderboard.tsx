import { StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';
import LeaderboardComponent, { LeaderboardSchema }  from '../../components/LeaderboardComponent'
import React, { useEffect, useState } from 'react';

interface LeaderboardData {
  header: Array<string>,
  data: Array<LeaderboardSchema>,
}

export default function LeaderboardScreen() {
  const [slapperInfo, setSlapperInfo] = useState(Array<LeaderboardSchema>);
  useEffect(() => {
    getStats()
    .then(data =>
      setSlapperInfo(data)
    );
  }, [])
  if (slapperInfo.length === 0) {
    return <>Loading...</>
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <LeaderboardComponent leaderboardData={slapperInfo}/>
    </View>
  );
}

async function getStats() {
  let values = await getRankingsJson('http://127.0.0.1:5000/get-elo')
  return values.data;
}
async function getRankingsJson(url: string): Promise<LeaderboardData> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<LeaderboardData>
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
