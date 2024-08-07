import { Button, StyleSheet, View, Text, TextInput, Modal, Pressable } from 'react-native';
import { useEffect, useState, useContext } from 'react';
// import { Text, View } from '../../components/Themed';
import { Dropdown } from 'react-native-element-dropdown';
import DropdownComponent, { DropdownSchema } from '../../components/DropdownComponent';
import { PlayerContext } from '../../components/DataContext';
// import { PlayerContext, usePlayerContext } from '../../components/DataContext';


interface NamesData {
  data: Array<DropdownSchema>
}

// TODO convert input fields into a reuseable component
function RecordTextField(myValue: string, setValue: React.SetStateAction<string>, placeholderText: string) {
  return (
    <TextInput
    style={styles.input}
    placeholder={placeholderText}
    // onChangeText={myValue => setValue(myValue)}
    />
  );
}

function getNumbers(text: string) {
  return text.replace(/[^0-9]/g, '')
}

export default function RecordMatch() {
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [win_val, setWinVal] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [namesList, setNewNames] = useState(Array<DropdownSchema>);
  useEffect(() => {
    getNames()
    .then(data => {
      setNewNames(data);
    });
  }, [])
  const playerContext = useContext(PlayerContext);
  // const myContextData = usePlayerContext();
  const myPlayerData = playerContext['playerData'];
  const myPlayerDataSet = playerContext['setPlayerData'];
  // const [myContextData, setContext] = usePlayerContext();
  console.log("Record match context: ", myPlayerData);
  if (namesList.length === 0) {
    return <>Loading...</>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Record Match</Text>
      <View style={styles.separator}/>
      {/* <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" /> */}
      {/* use radio button for win-con value */}
      {/* ensure competitor 1 != competitor 2 */}
      {/* check for valid score */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {setModalVisible(!modalVisible)}}
      >
        {/* this modal is a filler for submit feeback */}
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <Pressable onPress={() => setModalVisible(!modalVisible)}>
            <Text>Some user feedback!</Text>
          </Pressable>
          </View>
        </View>
      </Modal>
      {/* <DropdownComponent
      data={ namesList }
      labelField="label"
      valueField="value"
      onChange={(item: any) => {
        console.log(item);
        // setName1(item.label);
      }}
    /> */}
    <Button onPress={() => myPlayerDataSet([...myPlayerData, {key: 1, competitor_name: 'the new', elo: 3210}])}>I'm here for testing</Button>
    <Dropdown
      data={ namesList }
      style={styles.dropdown}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      labelField="label"
      valueField="value"
      placeholder="Competitor 1"
      searchPlaceholder="Search..."
      onChange={item => {
        setName1(item.label);
      }}
    />
    <Dropdown
      data={ namesList }
      style={styles.dropdown}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      labelField="label"
      valueField="value"
      placeholder="Competitor 2"
      searchPlaceholder="Search..."
      onChange={item => {
        setName1(item.label);
    }}
    />
    {/* <RecordTextField value={name1} setValue={setName1} placeholderText={"Temp"}/> */}
    <TextInput
      style={styles.input}
      placeholder='Match Score (i.e. 11, 21)'
      onChangeText={(value) => setWinVal(getNumbers(value))}
      inputMode='numeric'
      editable={true}
    />
    <TextInput
      style={styles.input}
      placeholder='Score 1'
      onChangeText={(value) => setScore1(getNumbers(value))}
      inputMode='numeric'
      editable={true}
    />
    <TextInput
      style={styles.input}
      placeholder='Score 2'
      onChangeText={(value) => setScore2(getNumbers(value))}
      inputMode='numeric'
      editable={true}
    />
    <Button
      title='Submit Details'
      onPress={()=>submit(name1, name2, win_val, score1, score2)}
      accessibilityLabel='Submit entered details'
    />
    {/* <button onClick={()=>submit(name1, name2, win_val, score1, score2)}>Submit Details</button> */}
  </View>
);
}

async function getNames() {
  const names = await getNamesJson('http://127.0.0.1:5000/record-match/get-pseudonyms')
  console.log("getNames:", names);
  return names;
  // TODO use [(id, name)] instead of [name]
}

async function submit(competitor_name_1: string, competitor_name_2: string,
  win_val: string, score_1: string, score_2: string) {
    
    fetch('http://127.0.0.1:5000/update', {
    method: 'post',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      "competitor_1": competitor_name_1,
      "competitor_2": competitor_name_2,
      "win_val": win_val,
      "score_1": score_1,
      "score_2": score_2,
    })
  });
}

async function getNamesJson(url: string): Promise<NamesData> {
  return fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response.json() as Promise<NamesData>
  })
}

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
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
  input: {
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "ffffff",
    padding: 5,
  },
  button: {
    padding: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
