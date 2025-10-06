'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import moment from 'moment';
import { 
  Box, 
  Flex,
  Container, 
  Heading,
  Grid,
  GridItem,
  SimpleGrid,
  Skeleton,
  useToast
} from "@chakra-ui/react"
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement, 
  Tooltip, 
  Legend, 
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { getDashboardData } from '@/app/actions/dashboard.actions';
import { DashboardDataType } from '@/app/types/types';
import { CHART_COLORS } from '@/app/constants';

// Register Chart.js components once outside component
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title, 
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ArcElement, 
  Tooltip, 
  Legend
);
interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

/**
 * Dashboard home page component with analytics charts
 */
export default function Dashboard() {
  const toast = useToast();

  const [eventTypeLabels,setEventTypeLabels] = useState<string[]>([]);
  const [eventTypeData,setEventTypeData] = useState<number[]>([]);
  const [regMonthLabels,setRegMonthLabels] = useState<string[]>([]);
  const [regData,setRegData] = useState<ChartDataset[]>([]);
  const [refCountLabels,setRefCountLabels] = useState<string[]>([]);
  const [refCountData,setRefCountData] = useState<ChartDataset[]>([]);
  const [signinData,setSigninData] = useState<ChartDataset[]>([]);
  const [signinLabels,setSigninLabels] = useState<string[]>([]);
  const [compSigninData,setCompSigninData] = useState<ChartDataset[]>([]);
  const [compSigninLabels,setCompSigninLabels] = useState<string[]>([]);
  const [isLoading,setIsLoading] = useState(false);

  // Memoized chart options for better performance
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
        beginAtZero: true,
      },
    },
  }), []);

  // Utility function for generating chart colors
  const generateChartColor = useCallback((index: number, opacity: number = 1): string => {
    const baseColors = [
      [255, 99, 132],
      [54, 162, 235],
      [255, 206, 86],
      [75, 192, 192],
      [153, 102, 255],
      [255, 159, 64]
    ];
    const colorIndex = index % baseColors.length;
    const [r, g, b] = baseColors[colorIndex];
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }, []);
  const fetchDashboardEvents = useCallback(async () => {
    setIsLoading(true)
    await getDashboardData()
      .then((response) => {
        if (response.success && response.data) {
          const responseData = response.data as DashboardDataType;
          //EVENT TYPE REGISTRATIONS 
          //only let non duplicate eventtypes into type array
          const eventTypeLabelsTemp: string[] = [];
          responseData.events.forEach((e)=>{
            if (e.event_types && !eventTypeLabelsTemp.includes(e.event_types.name)) {
              eventTypeLabelsTemp.push(e.event_types.name)
            }
          })
          const allTypeData: number[] = []
          eventTypeLabelsTemp.forEach(eventType => {
            allTypeData.push(responseData.events.filter(x=> x.event_types && x.event_types.name===eventType).length)
          })
          //convert null eventtypes to n/a
          const eventTypeLabelsNa: string[] = []
          eventTypeLabelsTemp.forEach((eventTypeLabel)=>{
            eventTypeLabelsNa.push(eventTypeLabel === null ? "N/A" : eventTypeLabel)
          })
          setEventTypeData(allTypeData)
          setEventTypeLabels(eventTypeLabelsNa)

          //PROGRAM REGISTRATIONS
          const regMonthLabelsTemp: string[] = []
          const regTypeLabelsTemp: string[] = []
          const regDataTemp: ChartDataset[] = []
          const registrations = responseData.registrations.sort((a,b)=>{
            return moment(new Date(a.datetime)).valueOf() - moment(new Date(b.datetime)).valueOf()
          })
          //put labels in temp arrays if they're not already in it
          for (const registration of registrations) {
            if (!regMonthLabelsTemp.includes(moment(registration.datetime).format("MMM YYYY"))) {
              regMonthLabelsTemp.push(moment.utc(registration.datetime).local().format("MMM YYYY"))
            }
            if (!regTypeLabelsTemp.includes(registration.event_types.name)) {
              regTypeLabelsTemp.push(registration.event_types.name)
            }
          }
          let k = 0;
          let j = 99;
          //loop through the month labels array and get the registration count for each month
          for (const regType of regTypeLabelsTemp) {
            const regData2: number[] = []
            regMonthLabelsTemp.map((regMonth) => {
                  let count = 0;
                  registrations.forEach((registration)=>{
                      if(moment(registration.datetime).format("MMM YYYY")===regMonth && registration.eventtypename===regType) {
                        count = count + 1;
                      }
                    })
                  return regData2.push(count)
                })
            regDataTemp.push({
              label: regType === null ? "N/A" : regType,
              data: regData2,
              borderColor: `rgba(${j}, ${k}, 200, 1)`,
              backgroundColor: `rgba(${j}, ${k}, 200, 1)`,
            })
            k += Math.random()*150;
            j += Math.random()*250;
          }
          setRegMonthLabels(regMonthLabelsTemp)
          setRegData(regDataTemp)


          //REFERENCE QUESTIONS
          const refMonthLabelsTemp: string[] = []
          const refCountTypeLabelsTemp: string[] = []
          const refCountDataTemp: ChartDataset[] = []
          const referencecount = responseData.referenceCount.sort((a,b)=>{
            return moment(new Date(a.datetime)).valueOf() - moment(new Date(b.datetime)).valueOf()
          })
          for (const reference of referencecount) {
            if (!refMonthLabelsTemp.includes(moment(reference.datetime).format("MMM YYYY"))) {
              refMonthLabelsTemp.push(moment.utc(reference.datetime).local().format("MMM YYYY"))
            }
            if (!refCountTypeLabelsTemp.includes(reference.reference_count_types.name)) {
              refCountTypeLabelsTemp.push(reference.reference_count_types.name)
            }
          }
          let l = 0;
          let m = 99;
          for (const refCount of refCountTypeLabelsTemp) {
            const refCountData2: number[] = []
            refMonthLabelsTemp.map((refMonth) => {
                  let count = 0;
                  referencecount.forEach((ref)=>{
                      if(moment(ref.datetime).format("MMM YYYY")===refMonth && ref.reference_count_types.name===refCount) {
                        count = count + 1;
                      }
                    })
                  return refCountData2.push(count)
                })
              refCountDataTemp.push({
              label: refCount,
              data: refCountData2,
              borderColor: `rgba(${l}, ${m}, 200, 1)`,
              backgroundColor: `rgba(${l}, ${m}, 200, 1)`,
            })
            l += Math.random()*150;
            m += Math.random()*250;
          }
          setRefCountLabels(refMonthLabelsTemp)
          setRefCountData(refCountDataTemp)

          //ROOM SIGN INS
          const roomSigninMonthLabelsTemp: string[] = []
          const roomSigninRooms: string[] = []
          const roomSigninDataTemp: ChartDataset[] = []
          const roomsignins = responseData.roomSignIns.sort((a,b)=>{
            return moment(new Date(a.datetime)).valueOf() - moment(new Date(b.datetime)).valueOf()
          })
          for(const signin of roomsignins) {
            if(!roomSigninMonthLabelsTemp.includes(moment(signin.datetime).format('MMM YYYY'))) {
              roomSigninMonthLabelsTemp.push(moment.utc(signin.datetime).local().format("MMM YYYY"))
            }
            if (signin.SignInLists && !roomSigninRooms.includes(signin?.SignInLists?.name)) {
              roomSigninRooms.push(signin.SignInLists?.name)
            }
          }
          let p = 0;
          let q = 99;
          for (const roomSigninRoom of roomSigninRooms) {
            const roomSigninData2: number[] = []
            roomSigninMonthLabelsTemp.forEach((signinMonth) => {
                  let count = 0;
                  roomsignins.forEach((roomsignin)=>{
                      if(moment(roomsignin.datetime).format("MMM YYYY")===signinMonth && roomsignin.SignInLists && roomsignin.SignInLists.name===roomSigninRoom) {
                        count = count + 1;
                      }
                    })
                  return roomSigninData2.push(count)
                })
                roomSigninDataTemp.push({
                  label: roomSigninRoom,
                  data: roomSigninData2,
                  borderColor: `rgba(${p}, ${q}, 200, 1)`,
                  backgroundColor: `rgba(${p}, ${q}, 200, 1)`,
                })
            p += Math.random()*150;
            q += Math.random()*250;
          }

          setSigninData(roomSigninDataTemp)
          setSigninLabels(roomSigninMonthLabelsTemp)


          //COMPUTER SIGN-INS
          const compSigninMonthLabelsTemp: string[] = []
          const compSigninComps: string[] = []
          const compSigninDataTemp: ChartDataset[] = []
          const compsignins = responseData.compSignIns.sort((a,b)=>{
            return moment(new Date(a.datetimein)).valueOf() - moment(new Date(b.datetimein)).valueOf()
          })
          for(const compsignin of compsignins) {
            if(!compSigninMonthLabelsTemp.includes(moment(compsignin.datetimein).format('MMM YYYY'))) {
              compSigninMonthLabelsTemp.push(moment.utc(compsignin.datetimein).local().format("MMM YYYY"))
            }
            if (!compSigninComps.includes(compsignin.Computers.name)) {
              compSigninComps.push(compsignin.Computers.name)
            }
          }
          let r = 0;
          let s = 99;
          for (const compSigninComp of compSigninComps) {
            const compSigninData2: number[] = []
            compSigninMonthLabelsTemp.forEach((signinMonth) => {
                  let count = 0;
                  compsignins.forEach((compsignin)=>{
                      if(moment(compsignin.datetimein).format("MMM YYYY")===signinMonth && compsignin.Computers.name===compSigninComp) {
                        count = count + 1;
                      }
                    })
                  return compSigninData2.push(count)
                })
                compSigninDataTemp.push({
                  label: compSigninComp,
                  data: compSigninData2,
                  borderColor: `rgba(${r}, ${s}, 200, 1)`,
                  backgroundColor: `rgba(${r}, ${s}, 200, 1)`,
                })
            r += Math.random()*150;
            s += Math.random()*250;
          }

          setCompSigninData(compSigninDataTemp)
          setCompSigninLabels(compSigninMonthLabelsTemp)

          setIsLoading(false)
        }
        else {
          console.error(response);
          toast({
            description: response.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
      .catch((res)=>{
        console.error(res);
        toast({
          description: res.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  },[toast])  
  useEffect(()=>{
    fetchDashboardEvents()
  },[fetchDashboardEvents]);



  const programTypeData = {
    labels: eventTypeLabels ? eventTypeLabels : [],
    datasets: [
      {
        label: '# of Programs',
        data: eventTypeData ? eventTypeData : [],
        backgroundColor: eventTypeData ? (
          eventTypeData.map((e,i)=>CHART_COLORS[i % CHART_COLORS.length])
        ) : [],
        borderWidth: 1,
      },
    ],
  };

  const regLinearData = {
    labels: regMonthLabels,
    datasets: regData,
  };

  const refCountLinearData = {
    labels: refCountLabels,
    datasets: refCountData,
  };

  const roomSigninLinearData = {
    labels: signinLabels,
    datasets: signinData,
  };

  const compSigninLinearData = {
    labels: compSigninLabels,
    datasets: compSigninData,
  };

  const fallbackData: ChartData = useMemo(() => ({
    labels: ['No Data'],
    datasets: [{
      label: 'No Data Available',
      data: [0],
      borderColor: generateChartColor(0),
      backgroundColor: generateChartColor(0, 0.5),
    }]
  }), [generateChartColor]);

  return (
    <Box id="main">
      <Container maxW="1320px" pb={5}>
        <Box mt={5}>
          <Skeleton isLoaded={!isLoading}>
            <Flex flexWrap="wrap" alignItems="center" justifyContent="center" w="100%">
              <SimpleGrid columns={[1,1,3]} width="100%" spacing={2}>
                <Flex boxShadow="md" flexDirection="column" p={2} border="1px" borderColor="inherit" rounded="md">
                  <Heading as="h6" size="sm">Program Registrations</Heading>
                  <Bar
                    options={chartOptions}
                    data={regData && regMonthLabels ? regLinearData : fallbackData}
                  />
                </Flex>

                <Flex shadow="md" flexDirection="column" p={2} border="1px" borderColor="inherit" rounded="md">
                  <Heading as="h6" size="sm">Room Sign-ins</Heading>
                  <Bar
                    options={chartOptions}
                    data={signinLabels && signinData ? roomSigninLinearData : fallbackData}
                  />
                </Flex>

                <Flex shadow="md" flexDirection="column" p={2} rounded="md" border="1px" borderColor="inherit">
                  <Heading as="h6" size="sm">Computer Sign-ins</Heading>
                  <Bar
                    options={chartOptions}
                    data={compSigninLabels && compSigninData ? compSigninLinearData : fallbackData}
                  />
                </Flex>
              </SimpleGrid>

              <Grid templateColumns="repeat(6,1fr)" gap={2} w="100%" mt={2}>
                <GridItem colSpan={[6,null,2]} boxShadow="md" p={3} rounded="md" border="1px" borderColor="inherit">
                  <Heading as="h4" size="sm">Programs by Type</Heading>
                  <Doughnut 
                    options={chartOptions} 
                    data={programTypeData} 
                  />
                </GridItem>

                <GridItem colSpan={[6,null,4]} boxShadow="md" p={3} rounded="md" border="1px" borderColor="inherit">
                  <Heading as="h4" size="sm">Program Registrations</Heading>
                  <Line 
                    options={chartOptions} 
                    data={regData && regMonthLabels ? regLinearData : fallbackData} 
                  />
                </GridItem>
              </Grid>

              <SimpleGrid columns={[1,1,2]} width="100%" spacing={2} mt={2}>
                <Box boxShadow="md" p={3} rounded="md" border="1px" borderColor="inherit">
                  <Heading as="h4" size="sm">Room Sign-Ins</Heading>
                  <Line 
                    options={chartOptions} 
                    data = {signinLabels && signinData ? roomSigninLinearData : fallbackData}
                  />
                </Box>

                <Box boxShadow="md" p={3} rounded="md" border="1px" borderColor="inherit">
                  <Heading as="h4" size="sm">Computer Sign-Ins</Heading>
                  <Line 
                    options={chartOptions} 
                    data={compSigninLabels && compSigninData ? compSigninLinearData : fallbackData}
                  />
                </Box>
              </SimpleGrid>

              <SimpleGrid columns={1} width="100%" spacing={2} mt={2}>
                <Box boxShadow="md" p={3} rounded="md" border="1px" borderColor="inherit">
                  <Heading as="h4" size="sm">Reference Questions</Heading>
                  <Line 
                    options={chartOptions} 
                    data={refCountLabels && refCountData ? refCountLinearData : fallbackData} 
                  />
                </Box>
              </SimpleGrid>
              
            </Flex>
          </Skeleton>
        </Box>
      </Container>
    </Box>
  );
}