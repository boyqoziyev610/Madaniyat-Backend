import { Router } from "express";
import AdminRouter from './admin.js';
import NewsRouter from './news.js';
import GroupCategoryRouter from './group_category.js'
import CenterRouter from './centers.js'
import WorkerRouter from './workers.js'
import RolesRouter from './roles.js'
import GroupsRouter from './groups.js'
import UserRouter from './users.js'
import MessageRouter from './messages.js';
import ChatRouter from './chats.js'
import AttendanceRouter from './attendance.js'
import ThemeRouter from './themes.js'
import VisitorRouter from './visitors.js'
import StudentRouter from './students.js'
import DocsRouter from './docs.js'
import UsefulContentRouter from './useful-contents.js'
import PlacesRouter from './places.js'
 

const router = Router();

router.use('/news', NewsRouter)
router.use('/admin', AdminRouter)
router.use('/groups', GroupsRouter)
router.use('/group_categories', GroupCategoryRouter)
router.use('/centers', CenterRouter)
router.use('/workers', WorkerRouter)
router.use('/users', UserRouter)
router.use('/roles', RolesRouter)
router.use('/messages', MessageRouter)
router.use('/chats', ChatRouter)
router.use('/attendance', AttendanceRouter)
router.use('/themes', ThemeRouter)
router.use('/visitors', VisitorRouter)
router.use('/students', StudentRouter)
router.use('/docs', DocsRouter)
router.use('/useful-contents', UsefulContentRouter)
router.use('/places', PlacesRouter)




export default router;  