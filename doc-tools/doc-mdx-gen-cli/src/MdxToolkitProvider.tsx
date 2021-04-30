import React, { PropsWithChildren, Fragment } from 'react';
import { ToolkitProvider, UIToolkitConfig } from '@doc/pages';

const Chapter = ({ children, title }: PropsWithChildren<{ title: string }>) => (
  <Fragment>
    <h2>{title}</h2>
    {children}
  </Fragment>
);

const Header = ({ children }: PropsWithChildren<{}>) => (
  <Fragment>{children}</Fragment>
);

export default function MdxToolkitProvider({
  children,
  docRelativeRoot
}: PropsWithChildren<{ docRelativeRoot: string }>) {
  const config: UIToolkitConfig = {
    Chapter,
    Header,
    List: ({ children, type = 'decimal' }) => (
      <ol style={{ listStyleType: type }}>{children}</ol>
    ),
    ListItem: ({ children }) => <li>{children}</li>,
    Paragraph: ({ children }) => <p>{children}</p>,
    RenderHtmlCard: ({ caption, html, snippet, title }) => (
      <exposnippet
        title={title}
        caption={caption}
        snippet={snippet}
        html={html}
      />
    ),
    SourceDisplay: (props) => <codeblockds {...props} />,
    Admonition: ({ children, type, title }) => (
      <admonition type={type} title={title}>
        {children}
      </admonition>
    ),
    RefBuilder: ({ name, url }) => <a href={url}>{name}</a>,
    RefDoc: ({ target, children }) => {
      const linkFragments =
        target.group === 'root'
          ? ['/docs', target.id]
          : ['/docs', target.group, target.id];
      return <a href={linkFragments.join('/')}>{children || target.title}</a>;
    },
    Acronym: ({ fullName, name, definition }) => (
      <abbr about={definition} children={name} title={fullName} />
    ),
    SvgFigure: ({ asset, description }) => (
      <svgfigure asset={asset} description={description} />
    ),
    InlineCode: ({ children }) => <code>{children}</code>,
    Hyperlink: ({ children, url }) => <a href={url}>{children}</a>,
    RefRenderHtmlProp: ({ name, docRelativePath, fragment }) => {
      return (
        <a
          href={`${docRelativeRoot}/${docRelativePath}.md${
            fragment ? `#${fragment}` : ''
          }`}>
          {name}
        </a>
      );
    }
  };
  return <ToolkitProvider config={config}>{children}</ToolkitProvider>;
}