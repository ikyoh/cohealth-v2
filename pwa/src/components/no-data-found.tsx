type Props = {
	title: string;
	description: string;
};


const NoDataFound = ({ title, description }: Props) => {
	return (
		<div className="bg-white dark:bg-black flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
			<div className="flex flex-col items-center gap-1 text-center">
				<h3 className="text-2xl font-bold tracking-tight">{title}</h3>
				<p className="text-sm text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}

export default NoDataFound;