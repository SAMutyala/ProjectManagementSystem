import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native'
import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState, useContext } from 'react'
import * as SQLite from 'expo-sqlite'
import { useRoute } from '@react-navigation/native'
import { UserContext } from '../UserContext'

function openDatabase() {
  if (Platform.OS === 'web') {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        }
      },
    }
  }

  const db = SQLite.openDatabase('db.db')
  return db
}

const db = openDatabase()

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { userId, setUserId, userEmail, setUserEmail, isAdmin, setIsAdmin } =
    useContext(UserContext)

  const navigation = useNavigation()

  useEffect(() => {
    try {
      db.transaction((tx) => {
        /*         tx.executeSql(
          `DROP TABLE IF EXISTS users;`,
          [],
          () => {
            //  console.log('Table created successfully.')
          },
          (error) => {
            console.log('Error creating table: ', error)
          }
        ) */
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT, isAdmin BOOLEAN)',
          [],
          () => {},
          (_, error) => {
            Alert.alert('Error', 'Error creating users table')
          }
        )
      })
    } catch (error) {
      Alert.alert('Error', 'Error opening database')
    }
  }, [])

  // Check if the 'projects' table exists, create it if not
  useEffect(() => {
    db.transaction((tx) => {
      /*       tx.executeSql(
        `DROP TABLE IF EXISTS projects;`,
        [],
        () => {
          //  console.log('Table created successfully.')
        },
        (error) => {
          console.log('Error creating table: ', error)
        }
      ) */
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, adminId INTEGER, completedByUserId INTEGER,
        completedDateTime TEXT, totalHours INTEGER, totalCost REAL, status TEXT)`,
        [],
        () => {
          //  console.log('Table created successfully.')
        },
        (error) => {
          console.log('Error creating table: ', error)
        }
      )
    })
  }, [])

  // Check if the 'Tasks' table exists, create it if not
  useEffect(() => {
    db.transaction((tx) => {
      /*       tx.executeSql(
        `DROP TABLE IF EXISTS tasks;`,
        [],
        () => {
          //  console.log('Table created successfully.')
        },
        (error) => {
          console.log('Error creating table: ', error)
        }
      ) */
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        projectId INTEGER,
        dependencyTaskId INTEGER,
        startDate TEXT,
        endDate TEXT,
        createdByUserId INTEGER,
        assignedToUserId INTEGER,
        completedByUserId INTEGER,
        completedDateTime TEXT,
        status TEXT,
        hourlyRate REAL,
        hoursWorked INTEGER,
        totalCost REAL
      )`,
        [],
        () => {
          //    console.log('Tasks table created successfully.')
        },
        (tx, error) => {
          console.log('Error creating tasks table: ', error)
        }
      )
    })
  }, [])

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password')
      return
    }

    if (!db) {
      return
    }

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (_, { rows }) => {
          if (rows.length > 0) {
            const results = rows._array
            results.map((user) => {
              setUserId(user.id)
              setUserEmail(user.email)
              setIsAdmin(user.isAdmin)
              console.log(isAdmin)
            })

            navigation.push('BottomNavbar', {
              screen: 'Dashboard',
            })
          } else {
            Alert.alert('Error', 'Invalid credentials')
          }
        },
        (_, error) => {
          Alert.alert('Error', 'Error executing login query')
        }
      )
    })
  }

  const handleRegister = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password')
      return
    }

    if (!db) {
      return
    }

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (_, { rows }) => {
          if (rows.length > 0) {
            Alert.alert('Error', 'User already exists')
          } else {
            tx.executeSql(
              'INSERT INTO users (email, password, isAdmin) VALUES (?, ?, ?)',
              [email, password, isAdmin],
              (_, { rowsAffected }) => {
                if (rowsAffected > 0) {
                  Alert.alert('Success', `${email} registered successfully.`)
                } else {
                  Alert.alert('Error', 'Error executing registration query')
                }
              },
              (_, error) => {
                Alert.alert('Error', 'Error executing registration query')
              }
            )
          }
        },
        (_, error) => {
          Alert.alert('Error', 'Error executing select query')
        }
      )
    })

    // Reset the form
    setEmail('')
    setPassword('')
    setIsAdmin(false)

    // Close the modal
    setIsModalVisible(false)
  }

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible)
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={styles.inputContainer} behavior="padding">
        <View>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            style={styles.input}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={[styles.buttonText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleModal}
            style={[styles.button, styles.buttonOutline]}
          >
            <Text style={styles.buttonOutlineText}>Register</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Registration</Text>
            <TextInput
              style={styles.modalinput}
              placeholder="Email"
              placeholderTextColor="gray"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.modalinput}
              placeholder="Password"
              placeholderTextColor="gray"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.adminCheckbox}
              onPress={() => setIsAdmin(!isAdmin)}
            >
              <Text style={styles.adminCheckboxText}>Admin</Text>
              <View style={styles.checkbox}>
                {isAdmin && <View style={styles.checkboxInner} />}
              </View>
            </TouchableOpacity>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={toggleModal}
              >
                <Text style={styles.cancelButtonLabel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '30%',
    marginTop: 5,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'white',
    marginTop: 5,
    borderColor: '#0782F9',
    borderWidth: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#0782F9',
    fontWeight: '700',
    fontSize: 16,
  },
  adminCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  adminCheckboxText: {
    fontSize: 16,
    marginRight: 10,
    color: 'gray',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: '#0782F9',
  },
  cancelButton: {
    backgroundColor: 'gray',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    margin: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalinput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
    marginBottom: 10,
    backgroundColor: 'white',
    marginTop: 8,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledModalButton: {
    opacity: 0.5,
  },
})
