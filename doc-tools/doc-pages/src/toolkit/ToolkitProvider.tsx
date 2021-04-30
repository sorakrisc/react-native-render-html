import React, { PropsWithChildren, useMemo } from 'react';
import acronymsIndex from '../acronymsIndex';
import figuresIndex from '../figuresIndex';
import pagesSpecs from '../pagesSpecs';
import { UIToolkit, UIToolkitConfig, UIToolkitRefs } from './toolkit-types';
import toolkitContext from './toolkitContext';

function buildRefs(Builder: UIToolkitConfig['RefBuilder']): UIToolkitRefs {
  return {
    RefCssProperty: ({ name }) => (
      <Builder name={name} url={`https://mdn.io/${name}`} />
    ),
    RefESSymbol: ({ name }) => (
      <Builder name={name} url={`https://mdn.io/${name}`} />
    ),
    // TODO enhance this by parsing this page and generating a linkmap in a
    // buildstep: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
    RefHtmlAttr: ({ name }) => (
      <Builder name={name} url={`https://mdn.io/attribute/${name}`} />
    ),
    RefHtmlElement: ({ name }) => (
      <Builder name={`<${name}>`} url={`https://mdn.io/${name}`} />
    ),
    RefLibrary: ({ name, url }) => <Builder name={name} url={url} />,
    RefRNSymbol: ({ name }) => (
      <Builder name={name} url={`https://reactnative.dev/docs/${name}`} />
    )
  };
}

function makeSnippet(html: string) {
  return `import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const html=\`${html.replace('`', '\\`')}\`;

export default function App() {
  const { width } = useWindowDimensions();
  return <RenderHtml source={{ html }} contentWidth={width} />;
}`;
}

export default function ToolkitProvider({
  children,
  config
}: PropsWithChildren<{ config: UIToolkitConfig }>) {
  const {
    RefBuilder,
    RenderHtmlCard,
    RefDoc,
    Acronym,
    SvgFigure,
    RefRenderHtmlProp,
    ...other
  } = config;
  const uitoolkit = useMemo<UIToolkit>(
    () => ({
      ...other,
      ...buildRefs(RefBuilder),
      RenderHtmlCard({ html, title, caption }) {
        return (
          <RenderHtmlCard
            html={html}
            title={title}
            caption={caption}
            snippet={makeSnippet(html)}
          />
        );
      },
      RefDoc({ target, children }) {
        if (!(target in pagesSpecs)) {
          throw new Error(`Target "${target}" is not a registered page.`);
        }
        return <RefDoc target={pagesSpecs[target]} children={children} />;
      },
      Acronym({ name }) {
        const acronym = acronymsIndex[name];
        return <Acronym {...acronym} />;
      },
      SvgFigure({ asset }) {
        const assetSpecs = figuresIndex[asset];
        return <SvgFigure asset={asset} description={assetSpecs.description} />;
      },
      RefRenderHtmlProp({ name }) {
        const fragment = name.toLowerCase();
        const docRelativePath = 'api/interfaces/renderhtmlprops';
        const pageAbsoluteUrl = `/docs/${docRelativePath}#${fragment}`;
        return (
          <RefRenderHtmlProp
            name={name}
            pageAbsoluteUrl={pageAbsoluteUrl}
            docRelativePath={docRelativePath}
            fragment={fragment}
          />
        );
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...Object.values(other), RefBuilder]
  );
  return (
    <toolkitContext.Provider value={uitoolkit}>
      {children}
    </toolkitContext.Provider>
  );
}