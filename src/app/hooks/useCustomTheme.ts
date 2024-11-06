import {useState, useEffect, useCallback} from 'react';
import { extendTheme } from '@chakra-ui/react'
import { getCustomTheme } from '../actions/usecustomtheme.actions';
import { CustomSettingsType } from '../types/types';

export const useCustomTheme = () => {
  const [primaryColor,setPrimaryColor] = useState("black")
  const [secondaryColor,setSecondaryColor] = useState("black")
  const [customSettings,setCustomSettings] = useState<CustomSettingsType | null>(null);

  const fetchCustomTheme = useCallback(async () => {
    const subdomain = window.location.host.split(".")[0];
    try {
        await getCustomTheme(subdomain)
        .then((response) => {
          if (response.success) {
            let cSettings: CustomSettingsType = response.data;
            let pColors = cSettings?.primary_color?.rgb ? cSettings.primary_color.rgb : 'rgb(100,100,100)';
            let sColors = cSettings && cSettings.secondary_color.rgb ? cSettings.secondary_color.rgb : 'rgb(100,100,100)';
            setPrimaryColor(pColors)
            setSecondaryColor(sColors)
            setCustomSettings(cSettings)
          }
        })
    } catch(error) {
        console.log(error);
    }
  },[])
  useEffect(()=>{
    fetchCustomTheme()
  },[fetchCustomTheme])
  return {customSettings,primaryColor,secondaryColor}
}

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  fonts: {
    heading: 'Inter, Open Sans, sans-serif'
  },
  styles: {
    global: {
      '#main': {
        p: '1px 16px',
        h: '100vh',
      },
      'div#main': {
        marginLeft: ['0','0','275px'],
      },
      '#main h1': {
        fontWeight: 700
      },
      '#main h2,#main h3,#main h4,#main h5,#main h6,#main th': {
        color: 'rgb(80, 80, 80)',
        fontWeight: 700
      },
      '#vr': {
        borderBottom: "1px solid",
        height: "1px",
        borderColor: "inherit",
        width: "100%",
        position: "absolute",
        bottom: 0
      },
      '#fe-main': {
        minHeight: "100vh",
        '.visually-hidden': {
          clipPath: 'inset(100%)',
          clip: 'rect(1px, 1px, 1px, 1px)',
          height: '1px',
          overflow: 'hidden',
          position: 'absolute',
          whiteSpace: 'nowrap',
          width: '1px'
        },
        '.element-and-tooltip': {
          position: 'relative',
          marginTop: 'auto',
          marginBottom: 'auto'
        },
        'div[role="tooltip"]': {
          display: 'none',
          position: 'absolute',
          right: '0',
          width: '10rem',
          backgroundColor: 'rgba(0,0,0,.8)',
          color: 'white',
          borderRadius: '10px',
          padding: '.5rem',
          zIndex: "100"

        },
        'button:hover + [role="tooltip"], button:focus + [role="tooltip"]' : {
          display: 'block'
        }
      }
    },
  },
}

export const theme = extendTheme( config )