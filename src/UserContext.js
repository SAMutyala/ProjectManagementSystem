import React from 'react'

const UserContext = React.createContext()

const UserProvider = ({ children }) => {
  const [userId, setUserId] = React.useState('')
  const [userEmail, setUserEmail] = React.useState('')
  const [isAdmin, setIsAdmin] = React.useState(false)
  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        userEmail,
        setUserEmail,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export { UserContext, UserProvider }
