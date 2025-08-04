
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
