import type {Playlist, Track} from './index';

export type StackParamList = {
  MainTabs: undefined;
  Playlist: {playlistId: string};
  Player: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList {}
  }
}




