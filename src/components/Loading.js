/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */


import styles from "../style/loading.module.css"

const LoadingEffect = () => {
    return (
        <div class={styles.lds_ellipsis}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
};

export { LoadingEffect };
