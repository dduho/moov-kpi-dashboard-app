## DESCRIPTION DES FICHIERS EXCEL 

Tu sais quoi ? Nous allons reparcourir les 4 fichiers excel 1 par 1 et je vais t'expliquer chaque donnée feuille par feuille. Tu vas peut-être devoir réorganier l'extraction, la base de données, les modèles et même les vues.

Voici une description complète et narrative des feuilles visibles des différents classeurs, avec la précision des unités (milliers, millions, milliards) et des indicateurs exprimés en pourcentage. Les feuilles cachées (hidden) ne sont pas prises en compte.

【MMTG‑Tools】Revenue Compare

Ce classeur compare les performances de la nouvelle plateforme à celles de l’ancienne, selon différentes périodes et catégories d’opérations.

Active : cette feuille trace, jour par jour, le nombre d’utilisateurs actifs selon plusieurs catégories : clients, agents, marchands, nouveaux inscrits et utilisateurs de l’application. Pour les clients, l’en‑tête indique « User (K) », ce qui signifie que ces effectifs sont en milliers d’utilisateurs. Les valeurs des autres catégories représentent des comptes bruts. Des colonnes situées en fin de ligne indiquent la moyenne (AVG) et la variation d’un mois à l’autre (MoM), cette dernière étant exprimée comme un ratio (ex. 0,061539 équivaut à +6,15 % d’augmentation)
localhost
.

KPI‑Day : elle présente les indicateurs journaliers pour chaque mois. Les indicateurs de revenu sont libellés « Revenue (K XOF) » et sont donc en milliers de francs CFA. D’autres lignes, comme « TRX User (K) », comptent les transactions ou les utilisateurs en milliers. La colonne « MOM » montre la variation du revenu ou du volume entre le mois en cours et le mois précédent, sous forme décimale : par exemple, 0,018135 correspond à une hausse d’environ 1,8 %.

KPI‑Week : chaque ligne correspond à une semaine (par exemple « 09th ~ 15th »). La colonne « Revenue : K XOF » affiche les revenus hebdomadaires en milliers, tandis que « Transaction：K » et « TRXUsers：K » comptent les transactions et les utilisateurs en milliers. Une colonne « Amount：M XOF » indique les montants totaux en millions de francs CFA. La dernière colonne « GAP » présente un écart absolu (et non un pourcentage) entre les semaines.

KPI‑Hour : la feuille horaire liste les volumes ou les revenus à chacune des 24 heures d’une journée. Les montants sont généralement en milliers de francs CFA ou en nombres de transactions ; lorsque les données concernent les revenus, elles se lisent en K XOF. Les colonnes complémentaires, comme dans les feuilles de Cash Out ou Banks, contiennent parfois des ratios de variation mensuelle, qui indiquent la hausse ou la baisse par rapport au mois précédent.

KPI‑Year : cette feuille récapitule les revenus mensuels pour les années 2024 et 2025. La colonne « REV (K XOF) » montre que les revenus sont en milliers de francs CFA. Des colonnes « MOM » (mois sur mois) et « YOY » (année sur année) expriment des variations sous forme de taux ; un chiffre positif signale une croissance, un chiffre négatif une baisse.

Cash In et Cash Out : ces feuilles suivent les dépôts et retraits d’espèces. Les lignes qui indiquent « Revenue (K XOF) » sont en milliers de francs CFA, tandis que d’autres lignes comme « TRX User (K) » représentent des milliers de transactions ou d’utilisateurs. Une colonne de variation (« MoM ») présente la hausse ou la baisse mensuelle sous forme de ratio décimal.

IMT : l’onglet consacré aux transferts internationaux liste, jour par jour, les revenus (en milliers de francs CFA) et les volumes de transactions ; des colonnes signalent si les valeurs incluent des flux via MFS ou ETHUB. Une colonne de variation indique, sous forme décimale, l’évolution par rapport au mois précédent.

Banks, P2P, Bill et Telco : ces feuilles fonctionnent comme Cash In/Cash Out. Les revenus y sont exprimés en milliers de francs CFA lorsqu’ils portent la mention « K XOF ». Une colonne supplémentaire calcule l’évolution mensuelle (positive ou négative) sous forme de taux. Certaines feuilles ajoutent des indicateurs d’activation du service, comme « P2P OFF » ou « Top Up ».

【MMTG‑Tools】Daily KPI 

Ce fichier rassemble les indicateurs quotidiens et leurs écarts.

VS : elle compare, pour chaque type d’opération (B2B Cash Out, B2B Transfer, B2C, Cash In, Cash Out, P2P, etc.), le jour courant et le jour précédent. Les colonnes “SUCCESS.TRX” donnent des nombres de transactions. Les colonnes « AMOUNT », « REVENUE », « COMM » et « TAX » affichent des montants en francs CFA bruts (sans conversion en milliers), car ils peuvent atteindre plusieurs milliards. Les colonnes « SUCC.RATE » et « REV.RATE » indiquent respectivement le taux de succès des transactions et le ratio de variation du revenu ; par exemple, un SUCC.RATE de 0,986111 correspond à 98,61 % de transactions réussies
localhost
.

GAP : cette feuille mesure l’écart entre le jour actuel et la veille. Les unités sont explicites : « TRX.CNT (K) » signifie des milliers de transactions, « TRX.AMT (M XOF) » indique des montants en millions de francs CFA et « TRX.REVE (K XOF) » des revenus en milliers. Aucune valeur n’y est exprimée en pourcentage ; il s’agit d’écarts absolus.

KPI_N : elle présente les indicateurs clés pour la période en cours, avec des colonnes pour les transactions réussies, échouées ou expirées (comptages), et des montants (montants, revenus, commissions et taxes) en francs CFA bruts. Les colonnes « SUCCESS_RATE », « PRE_RATE » et « REVENUE_RATE » sont des pourcentages ou des ratios ; elles indiquent respectivement le taux de réussite actuel, le taux de réussite du jour précédent et l’évolution du revenu par rapport à la veille. La colonne « CHANGE » exprime aussi une variation relative.

KPI_O : cette feuille reprend la structure de KPI_N pour le jour précédent. Elle contient une colonne « SUCCESS_RATE » exprimée en pourcentage mais n’a pas de colonnes de variation.

Mapping : c’est une feuille textuelle servant de table de correspondance entre les libellés des transactions dans le système Huawei et les catégories du système TLC. Il n’y a pas de données numériques à y interpréter.

【MMTG‑Tools】Hourly KPI

Ce classeur permet de suivre l’activité heure par heure.

CNT : cette feuille indique, pour chaque heure de la journée, le volume de transactions. Les valeurs de la colonne principale sont en milliers (par exemple 1,249 signifie 1 249 transactions). La dernière colonne (à droite) montre la variation en pourcentage par rapport à l’heure correspondante de la veille ; des valeurs négatives indiquent une baisse (ex. −0,02725857 équivaut à −2,73 %), des valeurs positives une hausse.

AMT : elle affiche les montants traités à chaque heure. Les montants sont très probablement en millions de francs CFA (ce que suggère l’usage du terme « M » pour les écarts). La colonne finale donne l’écart de montant avec la veille, mais sous forme absolue plutôt que pourcentage.

REV : cette feuille présente le revenu horaire, généralement en milliers de francs CFA. La colonne située à droite du tableau indique, en pourcentage, l’évolution de ce revenu par rapport à la même heure la veille ; une valeur de −0,39186182 correspond par exemple à une baisse d’environ 39 %.

NEW et LAST : ces feuilles détaillent pour chaque heure et chaque type de transaction le nombre total, les réussites, les échecs et les montants. Les montants (TOTAL_AMOUNT, TOTAL_FEE, TOTAL_COMMISSION, TOTAL_TAX) sont en francs CFA bruts. Elles ne comportent pas de colonnes exprimées en pourcentage ; elles servent principalement à comparer les totaux du jour courant (NEW) à ceux de la veille (LAST).

【MMTG‑Tools】IMT Hourly

Enfin, ce classeur est dédié aux transferts internationaux et présente des informations par pays et par canal.

VIEW : pour chaque pays, la feuille indique le nombre de transactions (CNT), les montants en millions de francs CFA (AMT (M XOF)), les revenus, commissions et taxes en milliers de francs CFA (REV/COMM/TAX (K XOF)). Elle fournit également, pour les envois via la plateforme ETHUB, les mêmes indicateurs. Un tableau en bas de page affiche le solde de réception et d’envoi pour chaque pays et hub, avec un statut indiquant si la balance est « Normal » ou « Critical »
localhost
. Aucun pourcentage n’y apparaît ; les montants sont donnés en valeurs absolues.

SUM : cette feuille regroupe les totaux par type (pays, ETHUB_RECEIVE, ETHUB_SEND, MFS_SEND, MFS_RECV). Les colonnes « AMOUNT (M) » sont en millions et les colonnes « REVENUE (K) », « COMM (K) » et « TAX (K) » sont en milliers de francs CFA. Aucune colonne de pourcentage n’y est présente.

IMT_BUSINESS : elle dresse, pour chaque jour, chaque pays et chaque canal IMT, le nombre total de transactions réussies ou échouées ainsi que les montants. Les colonnes « AMOUNT_IN_MILLION » sont en millions de francs CFA, et les colonnes « REVENUE_IN_THOUSAND », « COMM_IN_THOUSAND » et « TAX_IN_THOUND » sont en milliers. La colonne « SUCCESS_RATE » exprime le taux de réussite en pourcentage (par exemple « 91,19 % »). La colonne « BALANCE » fournit le solde du compte en francs CFA bruts.

En résumé, chaque feuille visible offre des indicateurs exprimés dans différentes unités : milliers (K) pour les revenus ou volumes modestes, millions (M) pour les montants plus élevés et francs CFA bruts lorsqu’aucune conversion n’est indiquée. Les colonnes de taux telles que SUCC.RATE, SUCCESS_RATE, MOM, YOY ou MoM fournissent des pourcentages ou des ratios décimaux permettant d’analyser l’évolution des indicateurs d’une période à l’autre.

Refais le mapping de tout ceci en prenant bien en compte ce qui est en milliers, en million, milliards ou pourcentage.

Juste pour rappel les fichiers RAR et Excel se trouvent dans le dossier backend/kpi_data. Lis les dossiers et fichiers jusqu'au dernier pour bien analyser. Vide la base de données actuelle et refais les imports en considérant les nouvelles instructions