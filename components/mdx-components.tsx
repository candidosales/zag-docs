import { allSnippets } from ".contentlayer/data"
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/tabs"
import { HStack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { Icon } from "@chakra-ui/icon"
import {
  frameworks,
  FRAMEWORKS,
  getFrameworkIndex,
  useFramework,
} from "lib/framework"
import { useMDXComponent } from "next-contentlayer/hooks"
import Link from "next/link"
import { FC, useState } from "react"

function SnippetItem({ code, id }) {
  const content = useMDX(code)
  return (
    <div className="prose" id="snippet" data-framework={id}>
      {content}
    </div>
  )
}

const components: Record<string, FC<Record<string, any>>> = {
  blockquote(props) {
    return <chakra.blockquote layerStyle="blockquote" {...props} />
  },
  h1(props) {
    return <chakra.h1 textStyle="h1" {...props} />
  },
  h2(props) {
    return <chakra.h2 textStyle="h2" {...props} />
  },
  h3(props) {
    return <chakra.h3 textStyle="h3" {...props} />
  },
  h4(props) {
    return <chakra.h4 textStyle="h4" {...props} />
  },
  pre(props) {
    return <chakra.pre {...props} className={`prose ${props.className}`} />
  },
  li(props) {
    return (
      <chakra.li
        sx={{
          "&::marker": {
            color: "cyan.default",
          },
        }}
        {...props}
      />
    )
  },
  inlineCode(props) {
    return <chakra.code className="prose" layerStyle="inlineCode" {...props} />
  },
  code(props) {
    if (typeof props.children === "string") {
      return <components.inlineCode {...props} />
    }
    return <div className="prose">{props.children}</div>
  },
  InstallSnippet(props) {
    const { package: pkg, ...rest } = props
    const installSnippet = allSnippets.find(
      (snippet) => snippet.slug === "install",
    )
    const code = useMDX(installSnippet.body.code.replaceAll("pkg", pkg))
    return <div {...rest}>{code}</div>
  },
  CodeSnippet(props) {
    const userFramework = useFramework()
    const snippets = allSnippets.filter((p) => p._id.endsWith(props.id))
    const [index, setIndex] = useState(
      getFrameworkIndex(userFramework ?? "react"),
    )
    return (
      <Tabs
        index={index}
        onChange={setIndex}
        width="full"
        maxW="768px"
        my="16"
        bg="gray.800"
        rounded="6px"
      >
        <TabList borderBottomWidth="1px" borderColor="gray.700">
          {FRAMEWORKS.map((framework) => (
            <Tab
              color="white"
              py="3"
              px="8"
              fontSize="sm"
              borderBottom="2px solid transparent"
              _selected={{ borderColor: "currentColor", color: "cyan.500" }}
              key={framework}
            >
              <HStack>
                <Icon as={frameworks[framework].icon} />
                <p>{frameworks[framework].label}</p>
              </HStack>
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {snippets.map((p) => (
            <TabPanel key={p._id} mt="-6">
              <SnippetItem id={p.framework} code={p.body.code} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    )
  },
  a(props) {
    const href = props.href
    const isInternalLink =
      href && (href.startsWith("/") || href.startsWith("#"))

    if (isInternalLink) {
      return (
        <Link href={href} passHref>
          <chakra.a textStyle="a" {...props}>
            {props.children}
          </chakra.a>
        </Link>
      )
    }

    return <a target="_blank" rel="noopener" {...props} />
  },
}

export function useMDX(code: string) {
  const MDXComponent = useMDXComponent(code)
  return <MDXComponent components={components} />
}
