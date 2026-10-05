import { BrowserRouter, HashRouter, Link, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './state/StoreProvider';
import { AppShell } from './components/AppShell';
import { Empty } from './components/Common';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Plaza } from './pages/Plaza';
import { NoticeDetail } from './pages/NoticeDetail';
import { NewThread, ThreadDetail } from './pages/Forum';
import { Agents, ToolWorkspace } from './pages/Agents';
import { Bookmarks, Documents, History, Mine, Settings } from './pages/Mine';

export function App() {
  const Router = window.location.protocol === 'file:' ? HashRouter : BrowserRouter;
  return (
    <Router>
      <StoreProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            <Route path="chat/:id" element={<Chat />} />
            <Route path="plaza" element={<Plaza />} />
            <Route path="plaza/new" element={<NewThread />} />
            <Route path="notice/:id" element={<NoticeDetail />} />
            <Route path="thread/:id" element={<ThreadDetail />} />
            <Route path="agents" element={<Agents />} />
            <Route path="agents/:tool" element={<ToolWorkspace />} />
            <Route path="mine" element={<Mine />} />
            <Route path="mine/bookmarks" element={<Bookmarks />} />
            <Route path="mine/history" element={<History />} />
            <Route path="mine/documents" element={<Documents />} />
            <Route path="mine/settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <Empty
                  title="这个页面暂时找不到"
                  action={
                    <Link to="/" className="primary-button">
                      回到首页
                    </Link>
                  }
                >
                  从首页继续探索校园助手吧。
                </Empty>
              }
            />
          </Route>
        </Routes>
      </StoreProvider>
    </Router>
  );
}
