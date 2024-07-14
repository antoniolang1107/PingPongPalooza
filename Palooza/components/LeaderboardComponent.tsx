import * as React from 'react';
import { DataTable } from 'react-native-paper';

export type LeaderboardSchema = {
    key: number,
    competitor_name: string,
    elo: number,
};

interface LeaderboardProps {
    leaderboardData: Array<LeaderboardSchema>,
}

const LeaderboardComponent: React.FC<LeaderboardProps> = ({leaderboardData}): React.JSX.Element => {
    console.log("Leaderboard component", leaderboardData);
    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([5, 15, 50]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[0]
    );
    const [items] = React.useState(leaderboardData);
    // const [items] = React.useState([
    //     {
    //         key: 1,
    //         competitor_name: 'Cupcake',
    //         elo: 356,
    //     },
    //     {
    //         key: 2,
    //         competitor_name: 'Eclair',
    //         elo: 262,
    //     },
    //     {
    //         key: 3,
    //         competitor_name: 'Frozen yogurt',
    //         elo: 159,
    //     },
    //     {
    //         key: 4,
    //         competitor_name: 'Gingerbread',
    //         elo: 305,
    //     },
    // ]);
    
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);
    
    React.useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);
    
    return (
        <DataTable>
        <DataTable.Header>
        <DataTable.Title>Name</DataTable.Title>
        <DataTable.Title numeric>Elo</DataTable.Title>
        </DataTable.Header>
        
        {items.slice(from, to).map((item) => (
            <DataTable.Row key={item.key}>
            <DataTable.Cell>{item.competitor_name}</DataTable.Cell>
            <DataTable.Cell numeric>{item.elo}</DataTable.Cell>
            </DataTable.Row>
        ))}
        
        <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(items.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} of ${items.length}`}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        showFastPaginationControls
        selectPageDropdownLabel={'Rows per page'}
        />
        </DataTable>
    );
};

export default LeaderboardComponent;