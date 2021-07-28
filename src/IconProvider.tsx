import { withApollo, WithApolloClient } from '@apollo/client/react/hoc';
import React, { useEffect, useReducer } from 'react';
import Icon from './Icon';
import store from './store';

export const IconContext = React.createContext({});

interface IconProviderProps {
  children: React.ReactNode;
}

function IconProvider(props: WithApolloClient<IconProviderProps>) {
  const [state, dispatch] = useReducer((state: any, action: any) => {
    console.log(state, action);
    if (action.type === 'init') {
      const treeData: any[] = [];
      // action.payload
      const library = action.payload[0];
      for (const icon of action.payload[0].icons) {
        if (!icon.tags.length) {
          treeData.push({ ...icon, id: `${library.name}/${icon.unicode}` });
        } else {
          for (const tag of icon.tags) {
            const treeNodeChildren = (tag as string)
              .split('/')
              .map((name, index, array) => ({
                id: array.slice(0, index + 1).join('/'),
                name,
                children: [],
              }))
              .reduce((data: any, current) => {
                console.log('.......', data, current);
                let treeNode = data.find((item: any) => item.id == current.id);
                if (!treeNode) {
                  data.push((treeNode = current));
                }
                return treeNode.children;
              }, treeData);
            treeNodeChildren.push({
              ...icon,
              id: `${library.name}/${icon.unicode}`,
            });
          }
        }
      }

      console.log('treeData', treeData);

      return {
        ...state,
        treeData,
        icons: action.payload.reduce((data: any, library: any) => {
          data.push(...library.icons);

          for (const icon of library.icons) {
            const TmpIcon = () => {
              return (
                <span
                  role="img"
                  aria-label={icon.name}
                  className={`anticon ${icon.name}`}
                  dangerouslySetInnerHTML={{
                    __html: icon.content,
                  }}
                />
              );
            };
            Icon.register(`${library.name}/${icon.unicode}`, TmpIcon);
            Icon.register(`${library.name}/${icon.name}`, TmpIcon);
          }

          return data;
        }, []),
      };
    }
    return state;
  }, {});

  const { client } = props;

  useEffect(() => {
    /*     if (data == null) {
      return;
    }
    console.log(data);
    dispatch({ type: 'init', payload: data.iconLibraries }); */
    store.loadRemote(client!);

    console.time('load libraries')
    store.libraries('1', '302').then(libraries => {
      console.log(libraries);
      console.timeEnd('load libraries')
    });


    console.time('loadIcons')
    store.icons('1').then(icons => {
      console.log('icons', icons);
      console.timeEnd('loadIcons')
    });

    console.time('loadTag')
    store.tags('1').then(tags => {
      console.log('tags', tags);
      console.timeEnd('loadTag')
    });

    /*     client!
      .query({
        query: ALL_ICON_LIBRARIES,
        fetchPolicy: 'no-cache',
      })
      .then(data => {
        console.log('data', data);
      }); */

    // console.log(store);
    // xxx
  }, []);

  return (
    <IconContext.Provider value={state}>{props.children}</IconContext.Provider>
  );
}

export default withApollo(IconProvider as any);
