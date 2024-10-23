import { 
  Box, 
  Flex,
  Button
} from "@chakra-ui/react";

const PageNavigation = ({pages,changePage}: {pages:any[], changePage: (e:any)=>void}) => {
  
  return (
    <Box pb={5}>
      <Flex mt={3} alignItems="center" gap="0.75em" justifyContent="center">
        {pages.length > 1 && pages.map((p,index) => {
          return (
            <Button 
              key={index}
              border={0}
              size="sm"
              maxW="2.5em"
              rounded="md"
              colorScheme="blue"
              p={0}
              value={index} 
              onClick={(e)=>changePage(e)}
            >
              {index + 1}
            </Button>
          )
        })}
      </Flex>
    </Box>
  )
}

export default PageNavigation;