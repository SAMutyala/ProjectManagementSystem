import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native'
import React, { useEffect, useState, useRef, useContext } from 'react'
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

const DashboardScreen = ({ route, navigation }) => {
  const { userId, setUserId, userEmail, setUserEmail, isAdmin, setIsAdmin } =
    useContext(UserContext)
  const [projectsOverview, setprojectsOverview] = useState([])
  const [tasksOverview, settasksOverview] = useState([])

  //Get project overview details
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT
      COUNT(DISTINCT projects.id) AS totalProjects,
      SUM(CASE WHEN projects.status = 'Completed' THEN 1 ELSE 0 END) AS completedProjects,
      SUM(CASE WHEN projects.status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressProjects,      
      COUNT(tasks.id) AS totalTasks,
      SUM(CASE WHEN tasks.status = 'Completed' THEN 1 ELSE 0 END) AS completedTasks,
      SUM(CASE WHEN tasks.status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks,
      SUM(tasks.hoursWorked) as totalHours,
      SUM(tasks.totalCost) as totalCost
    FROM projects
    LEFT JOIN tasks ON projects.id = tasks.projectId
    WHERE projects.adminId = ?`,
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const overviewData = rows.item(0)
            const projectOverview = {
              totalProjects: overviewData.totalProjects || 0,
              completedProjects: overviewData.completedProjects || 0,
              inProgressProjects: overviewData.inProgressProjects || 0,
              totalTasks: overviewData.totalTasks || 0,
              completedTasks: overviewData.completedTasks || 0,
              inProgressTasks: overviewData.inProgressTasks || 0,
              totalHours: overviewData.totalHours || 0,
              totalCost: overviewData.totalCost || 0,
            }
            //console.log('Project Overview:', projectOverview)
            // Set the project overview data to the state or use it as needed
            setprojectsOverview(projectOverview)
          } else {
            console.log('No project overview data available.')
          }
        },
        (tx, error) => {
          console.log('Error retrieving project overview:', error)
        }
      )
      // get tasks overview
      tx.executeSql(
        `SELECT
     
      COUNT(tasks.id) AS totalTasks,
      SUM(CASE WHEN tasks.status = 'Completed' THEN 1 ELSE 0 END) AS completedTasks,
      SUM(CASE WHEN tasks.status = 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks,
      SUM(tasks.hoursWorked) as totalHours,
      SUM(tasks.totalCost) as totalCost
    FROM tasks

    WHERE tasks.assignedToUserId = ?`,
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const overviewData = rows.item(0)
            const taskOverview = {
              totalTasks: overviewData.totalTasks || 0,
              completedTasks: overviewData.completedTasks || 0,
              inProgressTasks: overviewData.inProgressTasks || 0,
              totalHours: overviewData.totalHours || 0,
              totalCost: overviewData.totalCost || 0,
            }
            //console.log('Project Overview:', projectOverview)
            // Set the project overview data to the state or use it as needed
            settasksOverview(taskOverview)
          } else {
            console.log('No project overview data available.')
          }
        },
        (tx, error) => {
          console.log('Error retrieving project overview:', error)
        }
      )
    })
  }, [])

  const handleProjectButtonPress = () => {
    navigation.navigate('Projects')
  }

  const handleTasksButtonPress = () => {
    navigation.navigate('Tasks')
  }
  return (
    <View style={styles.container}>
      <Text>
        Hello {userEmail} {isAdmin ? '(Admin)' : ''}
      </Text>
      <Text style={styles.title}>Dashboard</Text>
      {isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.titleText}>My Projects Overview</Text>
          <Text>Total Projects: {projectsOverview.totalProjects}</Text>
          <Text>Total Cost: ${projectsOverview.totalCost}</Text>
          <Text>Total Hours: {projectsOverview.totalHours}</Text>
          <Text>Completed Projects: {projectsOverview.completedProjects}</Text>
          <Text>
            In-Progress Projects: {projectsOverview.inProgressProjects}
          </Text>
          <Text>Total Tasks: {projectsOverview.totalTasks}</Text>
          <Text>Completed Tasks: {projectsOverview.completedTasks}</Text>
          <Text>In-Progress Tasks: {projectsOverview.inProgressTasks}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => handleProjectButtonPress()}
              style={styles.cardbuttonProjects}
            >
              <Text style={styles.buttonTextProjects}>Projects</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View></View>
      )}
      <View style={styles.TasksCard}>
        <Text style={styles.titleText}>My Tasks Overview</Text>
        <Text>Total Tasks: {tasksOverview.totalTasks}</Text>
        <Text>Completed Tasks: {tasksOverview.completedTasks}</Text>
        <Text>In-Progress Tasks: {tasksOverview.inProgressTasks}</Text>
        <Text>Total Cost: ${tasksOverview.totalCost}</Text>
        <Text>Total Hours: {tasksOverview.totalHours}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => handleTasksButtonPress()}
            style={styles.cardbuttonTasks}
          >
            <Text style={styles.buttonTextTasks}>Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default DashboardScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '20%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    paddingTop: 5,
    paddingBottom: 5,
  },
  titleText: {
    fontSize: 18,
    paddingBottom: 5,
  },
  projectContainer: {
    padding: 10,
  },
  list: {
    marginTop: 20,
  },
  card: {
    backgroundColor: '#F0FFF0',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#90EE90',
    padding: 10,
  },
  TasksCard: {
    backgroundColor: '#F0FFFF',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ADD8E6',
    padding: 10,
  },
  completedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#009900',
  },
  inProgressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCC00',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardbuttonProjects: {
    borderWidth: 1,
    borderColor: '#009900',
    width: '30%',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonTextProjects: {
    color: '#009900',
    fontWeight: '700',
    fontSize: 16,
  },
  cardbuttonTasks: {
    borderWidth: 1,
    borderColor: '#0782F9',
    width: '30%',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonTextTasks: {
    color: '#0782F9',
    fontWeight: '700',
    fontSize: 16,
  },
  cardbuttonComplete: {
    backgroundColor: '#009900',
    width: '30%',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  disabledButtonTitle: {
    color: 'gray',
  },
})
