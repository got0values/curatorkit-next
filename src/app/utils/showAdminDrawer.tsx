'use client'

import { getLibraryAdminPw } from "../actions/utils.actions"

const showAdminDrawer = async (setShowDrawer: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
    await getLibraryAdminPw()
      .then((response) => {
        let apw = response.data
        if(window.prompt("Password") === `${apw}`) {
          setShowDrawer(true)
        } 
        else {
          window.alert("Wrong password")
        }
      })
  } catch(error) {
      console.log(error);
  }
}

export default showAdminDrawer;