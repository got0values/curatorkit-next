'use client'

import {useState,useRef,useEffect,useCallback} from 'react';
import {Tooltip as ReactTooltip} from 'react-tooltip';
import {FaRegQuestionCircle} from 'react-icons/fa';
import { hexToRgb } from '@/app/utils/hexToRgb';
import { hexToHsl } from '@/app/utils/hexToHsl';
import {BiLinkExternal} from 'react-icons/bi';
import { 
  Box, 
  Flex,
  Link,
  Button,
  Icon,
  Divider, 
  Heading,
  Image,
  FormLabel,
  Checkbox,
  Input,
  Text,
  Spinner
} from "@chakra-ui/react";
import { getCustomizeFe, postSaveCustomizeFe } from '@/app/actions/customizefe.actions';

export default function CustomizeFrontEnd() {
  const [isLoading,setIsLoading] = useState(false);
  
  const [formValues,setFormValues] = useState({
    allowDarkMode: false,
    primaryColor: "",
    secondaryColor: "",
    logoData: "",
    addressOne: "",
    addressTwo: "",
    phone: "",
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
    url: "",
    eventCalendarShow: false,
    requestStudyRoom: false,
    requestStudyRoomShow: false,
    readingClubShow: false,
    bigCalendarView: false,
    keepAccordionsOpen: false
  });
  
  const [showSecondaryColor,setShowSecondaryColor] = useState(false)
  const [subdomain,setSubdomain] = useState("");
  const [showPrimaryColor,setShowPrimaryColor] = useState(false)
  const [showLogo,setShowLogo] = useState(false)
  const [showHeaderInfo,setShowHeaderInfo] = useState(false)
  const [logoBlob,setLogoBlob] = useState("")
  const [blob,setBlob] = useState("");

  const fetchCustomizeFe = useCallback(async ()=>{
    setIsLoading(true)
    await getCustomizeFe()
      .then((response)=>{
        if (response.success) {
          const r = response.data;
          setSubdomain(response.data.subdomain)
          setIsLoading(false)
          if (r) {
            if (r.big_calendar_view !== null) {
              setFormValues(prev=>({...prev,bigCalendarView: r.big_calendar_view}))
            }
            setFormValues(prev=>({...prev,keepAccordionsOpen: r.keep_accordions_open}))
            if (r.primary_color.hex !== null) {
              setShowPrimaryColor(true)
              setFormValues(prev=>({...prev,primaryColor: r.primary_color.hex}))
            }
            if (r.secondary_color.hex !== null) {
              setShowSecondaryColor(true)
              setFormValues(prev=>({...prev,secondaryColor: r.secondary_color.hex}))
            }
            if (r.logo_blob !== null) {
              setShowLogo(true)
              setLogoBlob(r.logo_blob)
              setBlob(r.logo_blob)
            }
            if (r.library_url !== null) {
              setFormValues(prev=>({...prev,url: r.library_url}))
            }
            if (r.header_info !== null) {
              setShowHeaderInfo(true);
              let header_info_data = r.header_info
              setFormValues(prev=>(
                {
                  ...prev,
                  addressOne: header_info_data.address_one,
                  addressTwo: header_info_data.address_two,
                  phone: header_info_data.phone,
                  monday: header_info_data.monday,
                  tuesday: header_info_data.tuesday,
                  wednesday: header_info_data.wednesday,
                  thursday: header_info_data.thursday,
                  friday: header_info_data.friday,
                  saturday: header_info_data.saturday,
                  sunday: header_info_data.sunday
                }
              ))
            }
          }
        }
      }
    )
    .catch((res)=>{
      console.error(res)
    })
  },[])
  useEffect(()=>{
    fetchCustomizeFe()
  },[fetchCustomizeFe])

  const [tooLightWarningPrimary,setTooLightWarningPrimary] = useState(false)
  const [tooLightWarningSecondary,setTooLightWarningSecondary] = useState(false)
  function handleColorChange(e: any, color: string) {
    let hsl = hexToHsl(e.target.value)
    if (hsl.l > 30) {
      color === "primary" ? setTooLightWarningPrimary(true) : setTooLightWarningSecondary(true);
    }
    else {
      color === "primary" ? setTooLightWarningPrimary(false) : setTooLightWarningSecondary(false);
    }
  }

  function handleFileInput(e: any) {
    const logoFile = e.target.files[0]
    const imageBlob = URL.createObjectURL(logoFile)
    setBlob(imageBlob)

    const reader = new FileReader();
    reader.onload = function(e: any) {
      setLogoBlob(e.target.result)
    }
    reader.readAsDataURL(logoFile)
  }

  async function saveChanges(formData: FormData) {
    if (showPrimaryColor) {
      formData.set("primaryColor", JSON.stringify({
        hex: formData.get("primaryColor")?.valueOf(),
        rgb: hexToRgb(formData.get("primaryColor")?.valueOf())
      }))
    }
    else {
      formData.set("primaryColor", JSON.stringify({
        hex: null,
        rgb: null
      }))
    }
    if (showSecondaryColor) {
      formData.set("secondaryColor", JSON.stringify({
        hex: formData.get("secondaryColor")?.valueOf(),
        rgb: hexToRgb(formData.get("secondaryColor")?.valueOf())
      }))
    }
    else {
      formData.set("secondaryColor", JSON.stringify({
        hex: null,
        rgb: null
      }))
    }
    if (showLogo && logoBlob) {
      formData.set("logoData", logoBlob);
    }
    else {
      formData.set("logoData", "");
    }
    if (showHeaderInfo) {
      formData.set("headerInfo", JSON.stringify({
        address_one: formData.get("addressOne")?.valueOf() as string,
        address_two: formData.get("addressTwo")?.valueOf() as string,
        phone: formData.get("phone")?.valueOf() as string,
        monday: formData.get("monday")?.valueOf() as string,
        tuesday: formData.get("tuesday")?.valueOf() as string,
        wednesday: formData.get("wednesday")?.valueOf() as string,
        thursday: formData.get("thursday")?.valueOf() as string,
        friday: formData.get("friday")?.valueOf() as string,
        saturday: formData.get("saturday")?.valueOf() as string,
        sunday: formData.get("sunday")?.valueOf() as string
      }))
    }
    else {
      formData.set("headerInfo", "")
    }

    await postSaveCustomizeFe(formData)
      .then((response)=>{
        if (response.success) {
          window.alert("Saved!")
          fetchCustomizeFe();
        }
        else {
          console.error(response)
        }
      })
      .catch((res)=>{
        console.error(res)
      })
  }

  return (
    <Box as="form" id="main" action={saveChanges}>
      <Box 
        mt={4}
        pb={3}
        w="100%"
        position="relative"
      >
        <Box id="vr"></Box>
        <Flex alignItems="center" gap={3}>
          <Heading as="h1" size="lg" textAlign="center">Customize Front-end</Heading>
          <Link href={`https://${subdomain}.curatorkit.com/cal`} target="_blank" rel="noreferrer">
            <Button
              bgColor="transparent"
              fontSize="lg"
              p={0}
            >
              <BiLinkExternal/>
            </Button>
          </Link>
        </Flex>
      </Box>
      
      <Box pb="20px" mb={2}>
        {isLoading ? (
          <Flex w="100%" justifyContent="center">
            <Spinner size="xl"/>
          </Flex>
        ) : (
          <Flex 
            flexDirection="column"
            justifyContent="center" 
            mt={4}  
            pb={10} 
            w={["90%","90%","60%"]}
            marginLeft="auto"
            marginRight="auto"
            shadow="md"
            p="2rem"
            rounded="md"
            border="1px solid"
            borderColor="inherit"
          >
            <Box mb={2}>
              <Heading as="h2" size="md">Colors</Heading>
              <Flex h="2.5rem">
                <Flex alignItems="center" w="30%">
                  <Checkbox
                    m="5px"
                    name="primaryColorCheck"
                    isChecked={showPrimaryColor}
                    onChange={e=>setShowPrimaryColor(prev=>!prev)}
                  >
                    Primary Color
                  </Checkbox>
                </Flex>
                {showPrimaryColor ? (
                <Flex p={0} w="40%">
                  <Flex alignItems="center">
                    <Icon 
                      as={FaRegQuestionCircle} 
                      me={2}
                      color="black"
                      data-tip="Pick a color that is dark enough to provide enough <br/> contrast for visitors who have visual disabilities"
                      data-tooltip-id="primary-color-tooltip"
                    />
                    <ReactTooltip id="primary-color-tooltip"/>
                    <Input 
                      type="color"
                      w="35px"
                      p={0}
                      name="primaryColor"
                      value={formValues.primaryColor}
                      onChange={e=>{
                        handleColorChange(e,"primary");
                        setFormValues(prev=>({...prev,primaryColor: e.target.value}));
                      }}
                    />
                    {tooLightWarningPrimary ? (
                      <Text as="span" color="red" ms={2}>Too light!</Text>
                      ) : null
                    }
                  </Flex>
                </Flex>
                ) : <Flex></Flex> }
              </Flex>
              <Flex h="2.5rem">
                <Flex alignItems="center" w="30%">
                  <Checkbox
                    m="5px"
                    name="secondaryColorCheck"
                    isChecked={showSecondaryColor}
                    onChange={()=>setShowSecondaryColor(prev=>!prev)}
                  >
                    Secondary Color
                  </Checkbox>
                </Flex>
                {showSecondaryColor ? (
                <Flex p={0} w="40%">
                  <Flex alignItems="center">
                    <Icon 
                      as={FaRegQuestionCircle} 
                      me={2}
                      color="black"
                      data-tip="Pick a color that is dark enough to provide enough <br/> contrast for visitors who have visual disabilities"
                      data-tooltip-id="secondary-color-tooltip"
                    />
                    <ReactTooltip id="secondary-color-tooltip"/>
                    <Input 
                      type="color"
                      p={0}
                      w="35px"
                      name="secondaryColor"
                      value={formValues.secondaryColor}
                      onChange={e=>{
                        handleColorChange(e,"secondary");
                        setFormValues(prev=>({...prev,secondaryColor: e.target.value}));
                      }}
                    />
                    {tooLightWarningSecondary ? (
                      <Text as="span" ms={2} color="red">Too light!</Text>
                      ) : null
                    }
                  </Flex>
                </Flex>
                ) : <Flex></Flex> }
              </Flex>
              <Flex alignItems="center" h="2.5rem">
                <Checkbox
                  name="allowDarkMode"
                  isChecked={formValues.allowDarkMode}
                  onChange={(e)=>setFormValues(prev=>({...prev,allowDarkMode: e.target.checked ? true : false}))}
                  m="5px"
                >
                  Allow dark mode?
                </Checkbox>
                <Icon 
                  as={FaRegQuestionCircle} 
                  me={2}
                  color="black"
                  data-tip="Dark mode is not optimized for users with visual disabilities"
                  marginLeft={2}
                  data-tooltip-id="color-mode-tooltip"
                />
                <ReactTooltip id="color-mode-tooltip"/>
              </Flex>
            </Box>

            <Divider/>

            <Box mb={2}>
              <Heading as="h2" size="md" mt={3}>Header</Heading>
              <Flex alignItems="center" gap={2}>
                <FormLabel m={0} htmlFor="url-text">Homepage url:</FormLabel>
                <Input 
                  id="url-text"
                  width={["100%","100%","60%"]}
                  type="text"
                  placeholder="https://libraryname.com"
                  name="url"
                  value={formValues.url}
                  onChange={(e)=>setFormValues(prev=>({...prev,url: e.target.value}))}
                  autoComplete="off"
                />
              </Flex>
              <Flex h="2.5rem">
                <Flex alignItems="center" w="100%">
                  <Checkbox
                    m="5px"
                    isChecked={showLogo}
                    onChange={e=>setShowLogo(prev=>!prev)}
                  >
                    Logo
                  </Checkbox>
                </Flex>
              </Flex>

              {showLogo ? (
              <>
                <Input 
                  type="file"
                  size="md"
                  p={1}
                  border={0}
                  name="logoData"
                  className="form-control form-control-sm"
                  accept="image/*"
                  onChange={e=>handleFileInput(e)}
                />
                {blob ? (
                  <Box mt={4}>
                    <Image src={blob} alt="logo blob" w="100%"/>
                  </Box>
                ) : null }
              </>
              ): null }
              <Box my={2}>
                <Flex alignItems="center" w="100%">
                  <Checkbox
                    name="showHeaderInfo"
                    m="5px"
                    isChecked={showHeaderInfo}
                    onChange={()=>setShowHeaderInfo(prev=>!prev)}
                  >
                    Header Info
                  </Checkbox>
                </Flex>
                {showHeaderInfo ? (
                <Box w={["100%","100%","40%"]}>
                  <Box my={2}>
                    <FormLabel htmlFor="address" mb={0}>Address 1:</FormLabel>
                    <Input
                      id="address"
                      type="text"
                      name="addressOne"
                      value={formValues.addressOne}
                      onChange={(e)=>setFormValues(prev=>({...prev,addressOne: e.target.value}))}
                      autoComplete="off"
                    />
                  </Box>
                  <Box my={2}>
                    <FormLabel htmlFor="city" mb={0}>City/Zip:</FormLabel>
                    <Input
                      id="city"
                      type="text"
                      name="addressTwo"
                      value={formValues.addressTwo}
                      onChange={(e)=>setFormValues(prev=>({...prev,addressTwo: e.target.value}))}
                      autoComplete="off"
                    />
                  </Box>
                  <Box my={2}>
                    <FormLabel htmlFor="phone" mb={0}>Phone #:</FormLabel>
                    <Input
                      type="text"
                      name="phone"
                      value={formValues.phone}
                      onChange={(e)=>setFormValues(prev=>({...prev,phone: e.target.value}))}
                      autoComplete="off"
                    />
                  </Box>
                  <Flex alignItems="center" h="3rem">
                    <FormLabel htmlFor="monday" mb={0}>Monday: </FormLabel>
                    <Input
                      id="monday"
                      type="text"
                      ms={1}
                      name="monday"
                      value={formValues.monday}
                      onChange={(e)=>setFormValues(prev=>({...prev,monday: e.target.value}))}
                      autoComplete="off"
                    />
                  </Flex>
                  <Flex alignItems="center" h="3rem">
                    <FormLabel htmlFor="tuesday" mb={0}>Tuesday: </FormLabel>
                    <Input
                      id="tuesday"
                      type="text"
                      ms={1}
                      name="tuesday"
                      value={formValues.tuesday}
                      onChange={(e)=>setFormValues(prev=>({...prev,tuesday: e.target.value}))}
                      autoComplete="off"
                    />
                  </Flex>
                  <Flex alignItems="center" h="3rem">
                    <FormLabel htmlFor="wednesday" mb={0}>Wednesday: </FormLabel>
                    <Input
                      id="wednesday"
                      type="text"
                      ms={1}
                      name="wednesday"
                      value={formValues.wednesday}
                      onChange={(e)=>setFormValues(prev=>({...prev,wednesday: e.target.value}))}
                      autoComplete="off"
                    />
                  </Flex>
                  <Flex alignItems="center" h="3rem">
                    <FormLabel htmlFor="thursday" mb={0}>Thursday: </FormLabel>
                    <Input
                      id="thursday"
                      type="text"
                      ms={1}
                      name="thursday"
                      value={formValues.thursday}
                      onChange={(e)=>setFormValues(prev=>({...prev,thursday: e.target.value}))}
                      autoComplete="off"
                    />
                  </Flex>
                  <Flex alignItems="center" h="3rem">
                    <FormLabel htmlFor="friday" mb={0}>Friday: </FormLabel>
                    <Input
                      id="friday"
                      type="text"
                      ms={1}
                      name="friday"
                      value={formValues.friday}
                      onChange={(e)=>setFormValues(prev=>({...prev,friday: e.target.value}))}
                      autoComplete="off"
                    />
                  </Flex>
                  <Flex alignItems="center" h="3rem">
                    <FormLabel htmlFor="saturday" mb={0}>Saturday: </FormLabel>
                    <Input
                      id="saturday"
                      type="text"
                      ms={1}
                      name="saturday"
                      value={formValues.saturday}
                      onChange={(e)=>setFormValues(prev=>({...prev,saturday: e.target.value}))}
                      autoComplete="off"
                    />
                  </Flex>
                  <Flex alignItems="center" h="3rem">
                    <FormLabel htmlFor="sunday" mb={0}>Sunday: </FormLabel>
                    <Input
                      id="sunday"
                      type="text"
                      ms={1}
                      name="sunday"
                      value={formValues.sunday}
                      onChange={(e)=>setFormValues(prev=>({...prev,sunday: e.target.value}))}
                      autoComplete="off"
                    />
                  </Flex>
                </Box>
                ) : (
                  null
                )}
              </Box>
            </Box>

            <Divider/>

            <Box my={2}>
              <Heading as="h2" size="md"  mt={3}>Navbar</Heading>
              <Flex alignItems="center" h="3rem">
                <Checkbox
                  name="eventCalendarShow"
                  isChecked={formValues.eventCalendarShow}
                  onChange={(e)=>setFormValues(prev=>({...prev,eventCalendarShow: e.target.checked ? true : false}))}
                  m="5px"
                >
                  Show Event Calendar?
                </Checkbox>
              </Flex>
              <Flex alignItems="center" h="3rem">
                <Checkbox
                  name="requestStudyRoomShow"
                  isChecked={formValues.requestStudyRoomShow}
                  onChange={(e)=>setFormValues(prev=>({...prev,requestSutdyRoomShow: e.target.checked ? true : false}))}
                  m="5px"
                >
                  Show Request a Study Room?
                </Checkbox>
              </Flex>
              <Flex alignItems="center" h="3rem">
                <Checkbox
                  name="readingClubShow"
                  isChecked={formValues.readingClubShow}
                  onChange={(e)=>setFormValues(prev=>({...prev,readingClubShow: e.target.checked ? true : false}))}
                  m="5px"
                >
                  Show Reading Club?
                </Checkbox>
              </Flex>
            </Box>

            <Divider/>

            <Box my={2}>
              <Heading as="h2" size="md"  mt={3}>Calendar</Heading>
              <Flex alignItems="center" h="3rem">
                <Checkbox
                  name="bigCalendarView"
                  isChecked={formValues.bigCalendarView}
                  onChange={(e)=>setFormValues(prev=>({...prev,bigCalendarView: e.target.checked ? true : false}))}
                  m="5px"
                >
                  Allow big calendar view?
                </Checkbox>
                <Icon 
                  as={FaRegQuestionCircle} 
                  me={2}
                  color="black"
                  data-tip="Big calendar view is not optimized for screen reader users"
                  marginLeft={2}
                  data-tooltip-id="bc-view"
                />
                <ReactTooltip id="bc-view"/>
              </Flex>
              <Flex alignItems="center" h="3rem">
                <Checkbox
                  name="keepAccordionsOpen"
                  isChecked={formValues.keepAccordionsOpen}
                  onChange={(e)=>setFormValues(prev=>({...prev,keepAccordionsOpen: e.target.checked ? true : false}))}
                  m="5px"
                >
                  Keep Accordions Open?
                </Checkbox>
              </Flex>
            </Box>

            <Flex w="100%" mt={3}>
              <Button 
                colorScheme="blue"
                type="submit"
                w="100%"
              >
                Save
              </Button>
            </Flex>
          </Flex>
        )}
      </Box>
    </Box>
  )
}