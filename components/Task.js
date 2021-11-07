import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Button,
    TextInput,
    Keyboard,
    Platform,
} from "react-native";

import CheckBox from 'react-native-check-box';
import AsyncStorage from '@react-native-async-storage/async-storage';
const isAndroid = Platform.OS == "android";
const viewPadding = 10;

const Task =():any=> {
    let [tasks,setTasks] = useState([]);
    let [text,setText]= useState("");
    let [stateViewPadding,setViewPadding] = useState(viewPadding);

    const changeTextHandler = value => setText(value);

    const onAddTask = () => {
        let notEmpty = text.trim().length > 0;
        if (notEmpty) {
            setText('');
            let addedTasks = [...tasks,{ key: tasks.length, text: text, checked: false }];
            setTasks(addedTasks);
            Tasks.store(addedTasks);
        }
    };

    const onCheckTask = (i,checked) => {
        tasks[i].checked = checked;
        let newTasks = [...tasks];
        setTasks(newTasks);
        Tasks.store(newTasks);
    };

    const onDeleteTask = i => {
        tasks.slice();
        tasks.splice(i, 1);
        let newTasks = [...tasks];
        setTasks(newTasks);
        Tasks.store(newTasks);
    };

    useEffect(()=> {
        Keyboard.addListener(
            isAndroid ? "keyboardDidShow" : "keyboardWillShow",
            e => setViewPadding( e.endCoordinates.height + stateViewPadding )
        );

        Keyboard.addListener(
            isAndroid ? "keyboardDidHide" : "keyboardWillHide",
            () => setViewPadding( stateViewPadding )
        );

        Tasks.get(tasks => setTasks(tasks || [] ));
    },[]);

    return (
        <View
            style={[styles.container, { paddingBottom: stateViewPadding }]}
        >
            <Text>Task</Text>
            <FlatList
                style={styles.list}
                data={tasks}
                renderItem={({ item, index }) => {
                    return <View>
                        <View style={styles.listItemCont}>
                            <CheckBox
                                style={{flex: 1, padding: 10}}
                                onClick={() =>onCheckTask(index,!item.checked)}
                                isChecked={item.checked}
                                rightText={item.text}
                                checkBoxColor={item.checked ? 'green' : 'black'}
                            />
                            <Button title="x" onPress={() => onDeleteTask(index)} />
                        </View>
                    </View>
                }}
                keyExtractor={item => item.key.toString()}
            />
            <TextInput
                style={styles.textInput}
                onChangeText={changeTextHandler}
                onSubmitEditing={onAddTask}
                value={text}
                placeholder="Add Task"
                returnKeyType="done"
                returnKeyLabel="done"
            />
        </View>
    );
};

const getData = async cb => {
    try {
        let string = await AsyncStorage.getItem('TASKS');
        let task = string ? JSON.parse(string) : [];
        console.log('getData task',task);
        return cb(task);
    } catch(e) {
        console.log(e);
        return [];
        // error reading value
    }
};

const storeData = async tasks => {
    console.log('storeData tasks',tasks);
    try {
        await AsyncStorage.setItem('TASKS',JSON.stringify(tasks));
    } catch (e) {
        // saving error
        console.log(e);
    }
}

let Tasks = {
    get(cb) {
        let init = async ()=> await getData(cb);
        return init();
    },
    store(tasks) {
        let init = async ()=> await storeData(tasks);
        init();
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5FCFF",
        padding: viewPadding,
        paddingTop: 20
    },
    list: {
        width: "100%"
    },
    listItem: {
        paddingTop: 2,
        paddingBottom: 2,
        fontSize: 18
    },
    listItemCont: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#d6d7da',
    },
    textInput: {
        height: 40,
        paddingRight: 10,
        paddingLeft: 10,
        borderColor: "gray",
        borderWidth: isAndroid ? 0 : 1,
        width: "100%"
    }
});

export default Task;
