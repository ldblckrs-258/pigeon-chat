import { twMerge } from 'tailwind-merge'
import ChatContent from './ChatContent'
import ChatBoxHeader from './ChatBoxHeader'
import ChatBoxFooter from './ChatBoxFooter'

const ChatBox = ({
	className = '',
	isInfoExpand,
	onClickInfoButton,
	chatInfo,
}) => {
	return (
		<div
			className={twMerge(
				'relative flex h-full flex-1 flex-col overflow-hidden rounded-lg',
				className,
			)}
		>
			<ChatBoxHeader
				chatInfo={chatInfo}
				onClickInfoButton={onClickInfoButton}
				isInfoExpand={isInfoExpand}
			/>
			<div className="h-full min-h-0 w-full bg-white py-[78px] pl-4 pr-1">
				<ChatContent
					className="flex h-full w-full flex-col-reverse overflow-y-scroll pb-2 pt-4"
					chatId={chatInfo._id}
					isGroup={chatInfo.isGroup}
				></ChatContent>
			</div>
			<ChatBoxFooter chatInfo={chatInfo} />
		</div>
	)
}

export default ChatBox
