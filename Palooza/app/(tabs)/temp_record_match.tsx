import { StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';
import { ExampleDropdown } from '../../components/Example_Dropdown';

export default function RecordMatch() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Match</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/* IDEA: query for names, populate dropdown */}
      {/* use radio button for win-con value */}
      {/* ensure competitor 1 != competitor 2 */}
      {/* check for valid score */}
      <ExampleDropdown></ExampleDropdown>
      <button onClick={getNames}>Get Names</button>
      <input id='competitor 1' placeholder='competitor 1'></input>
      <input id='competitor 2' placeholder='competitor 2'></input>
      <input id='win val' placeholder='win val'></input>
      <input id='score 1' placeholder='score 1'></input>
      <input id='score 2' placeholder='score 2'></input>
      <button onClick={submit}>Submit Details</button>
      {/* <Form></Form> */}
    </View>
  );
}

async function getNames() {
  const names = await api('http://127.0.0.1:5000/record-match/get-pseudonyms')
  console.log(names)
}

async function submit() {

  // const firstName = document.getElementById("firstName") as HTMLInputElement;
  
  fetch('http://127.0.0.1:5000/update', {
    method: 'post',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      "competitor_1": "temp",
      "competitor_2": "temp",
      "win_val": 21,
      "score_1": 21,
      "score_2": 19,
    })
  });
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
